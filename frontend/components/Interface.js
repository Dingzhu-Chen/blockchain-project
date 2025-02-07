import { useState } from "react";
import $u from "../utils/$u.js";
import { ethers } from "ethers";

const wc = require("../circuit/witness_calculator.js");

const tornadoAddress = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
const tornadoJSON =require("../json/Tornado.json");
const tornadoABI = tornadoJSON.abi;
const tornadoInterface = new ethers.Interface(tornadoABI);

const Interface = () => {
    const [account, updateAccount] = useState(null);
    const [proofElements, updateProofElements] = useState(null);
    const [proofStringEl, updateProofStringEl] = useState(null);
    const [textArea, updateTextArea]= useState(null);

    const connectMetamask = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install Metamask to use this app.");
                throw "no-metamask";
            }

            var accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            var chainId = window.ethereum.networkVersion;
            var activeAccount = accounts[0];
            var balance = await window.ethereum.request({ method: "eth_getBalance", params: [activeAccount, "latest"] });
            //balance = ethers.formatEther(balance);
            //balance = $u.moveDecimalLeft(ethers.BigNumber.from(balance).toString(),18);
            //balance = $u.moveDecimalLeft(ethers.formatEther(balance).toString(),18);
            balance = ethers.formatEther(balance).toString();
            var newAccountState = {
                chainId: chainId,
                address: activeAccount,
                balance: balance
            };
            updateAccount(newAccountState);
        } catch (e) {
            console.log(e);
        }
    };
    
    const depositEther = async () => {
        const secret = ethers.toBigInt(ethers.getBytes(ethers.randomBytes(32))).toString();
        const nullifier = ethers.toBigInt(ethers.getBytes(ethers.randomBytes(32))).toString();
    
        const input = {
            secret: $u.BN256ToBin(secret).split(""),
            nullifier: $u.BN256ToBin(nullifier).split("")
        };

        var res = await fetch("/deposit.wasm"); 
        var buffer = await res.arrayBuffer(); 
        var depositWC = await wc(buffer);

        const r = await depositWC.calculateWitness(input, 0);

        const commitment = r[1];
        const nullifierHash = r[2];

        const value = ethers.toBigInt("1000000000000000000").toString(16);

        const tx = {
            to: tornadoAddress,
            from: account.address,
            value: value,
            data: tornadoInterface.encodeFunctionData("deposit", [commitment])
        };

        try {
            const txHash = await window.ethereum.request({ method: "eth_sendTransaction", params: [tx] });
            const receipt = await window.ethereum.request({ method: "eth_getTransactionReceipt", params: [txHash] });
            const log = receipt.logs[0];
        
            const decodedData = tornadoInterface.decodeEventLog("Deposit", log.data, log.topics);
            console.log(decodedData);

    // 修改后的depositEther函数部分
    const proofElements = {
        root: $u.BNToDecimal(decodedData.root),
        nullifierHash: nullifierHash.toString(), // 显式转换为字符串
        secret: secret,
        nullifier: nullifier,
        commitment: commitment.toString(),       // 显式转换为字符串
        hashPairings: decodedData.hashPairings.map((n) => ($u.BNToDecimal(n))),
        hashDirections: decodedData.pairDirection
    };

    // 修改JSON.stringify调用，添加replacer处理BigInt
    updateProofElements(btoa(JSON.stringify(proofElements, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString(); // 将BigInt转为字符串
        }
        return value;
    })));
        }catch (e){
            console.log(e);
        }
    };

    const copyProof = () => {
        if (!!proofStringEl) {
            navigator.clipboard.writeText(proofStringEl.innerHTML);
        }
    };

    const withdraw = async () => {
        if (!textArea || !textArea.value) { 
            alert("Please input the proof of deposit string."); 
        }
    
        try {
            const proofString = textArea.value;
            const proofElements = JSON.parse(atob(proofString));
            const SnarkJS = window['snarkjs'];
        
            const proofInput = {
                "root": proofElements.root,
                "nullifierHash": proofElements.nullifierHash,
                "recipient": $u.BNToDecimal(account.address),
                "secret": $u.BN256ToBin(proofElements.secret).split(""),
                "nullifier": $u.BN256ToBin(proofElements.nullifier).split(""),
                "hashPairings": proofElements.hashPairings,
                "hashDirections": proofElements.hashDirections
            };

            const { proof, publicSignals } = await SnarkJS.groth16.fullProve(proofInput, "/withdraw.wasm", "/setup_final.zkey");
            // console.log(proof);
            // console.log(publicSignals);
            const callInputs = [
                proof.pi_a.slice(0, 2).map($u.BN256ToHex),
                proof.pi_b.slice(0, 2).map((row) => ($u.reverseCoordinate(row.map($u.BN256ToHex)))),
                proof.pi_c.slice(0, 2).map($u.BN256ToHex),
                publicSignals.slice(0, 2).map($u.BN256ToHex)
            ];
            
            const callData = tornadoInterface.encodeFunctionData("withdraw", callInputs);
            const tx = {
                to: tornadoAddress,
                from: account.address,
                data: callData
            };

            const txHash = await window.ethereum.request({ method: "eth_sendTransaction", params: [tx] });
            const receipt = await window.ethereum.request({ method: "eth_getTransactionReceipt", params: [txHash] });

            console.log(receipt);

            
        } catch (e) {
            console.log(e);
        }
        
    };
    
    return (
        <div>
            {
                !!account ? (
                    <div>
                        <p>ChainId: {account.chainId}</p>
                        <p>Wallet Address: {account.address}</p>
                        <p>Balance: {account.balance} ETH</p>
                    </div>
                ) : (
                    <div>
                        <button onClick={connectMetamask}>Connect Metamask</button>
                    </div>
                )
            }

            <div>
                <hr/>
            </div>
            {
                !!account ? (
                    <div>
                        {
                            !!proofElements ? (
                                <div>
                                    <p><strong>Proof of Deposit:</strong></p>
                                    <div style={{ maxWidth: "100vw", overflowWrap: "break-word" }}>
                                        <span ref={(proofStringEl) => { updateProofStringEl(proofStringEl); }}>{proofElements}</span>
                                    </div>
                                    {
                                        !!proofStringEl && (
                                            <button onClick={copyProof}>Copy Proof String</button>
                                        )
                                    }
                                </div>
                            ) : (
                                <button onClick={depositEther}>Deposit 1 ETH</button>
                            )
                        }
                    </div>
                ) : (
                    <div>
                        <p>You need to connect Metamask to use this section.</p>
                    </div>
                )
            }
            <div>
                <hr/>
            </div>
            {
                !!account ? (
                    <div>
                        <div>
                            <textarea ref={(ta) => { updateTextArea(ta); }}></textarea>
                        </div>
                        <button onClick={withdraw}>Withdraw 1 ETH</button>
                    </div>
                ) : (
                    <div>
                        <p>You need to connect Metamask to use this section.</p>
                    </div>
                )
            }

        </div>
    );
}
    export default Interface;
    

// import { useState } from "react";
// import $u from "../utils/$u.js";
// import { BrowserProvider, Contract, parseEther, Interface } from "ethers";

// const wc = require("../circuit/witness_calculator.js");

// const tornadoAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
// const tornadoJSON = require("../json/Tornado.json");
// const tornadoABI = tornadoJSON.abi;
// const tornadoInterface = new Interface(tornadoABI); // ✅ Corrected instantiation

// const InterfaceComponent = () => {
//     const [account, updateAccount] = useState(null);

//     const connectMetamask = async () => {
//         try {
//             if (!window.ethereum) {
//                 alert("Please install Metamask to use this app.");
//                 throw new Error("Metamask not installed");
//             }

//             const provider = new BrowserProvider(window.ethereum); // ✅ Correct provider for ethers v6
//             const signer = await provider.getSigner();
//             const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//             const activeAccount = accounts[0];
//             const balanceWei = await provider.getBalance(activeAccount);

//             const newAccountState = {
//                 chainId: (await provider.getNetwork()).chainId,
//                 address: activeAccount,
//                 balance: parseEther(balanceWei.toString()).toString(),
//             };

//             updateAccount(newAccountState);
//         } catch (e) {
//             console.error("Metamask Connection Failed:", e);
//         }
//     };

//     const depositEther = async () => {
//         try {
//             if (!account) {
//                 alert("Connect Metamask first!");
//                 return;
//             }

//             const provider = new BrowserProvider(window.ethereum);
//             const signer = await provider.getSigner();
//             const tornadoContract = new Contract(tornadoAddress, tornadoABI, signer);

//             // Generate secret and nullifier
//             const secret = BigInt("0x" + crypto.getRandomValues(new Uint8Array(32))
//                 .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""));
//             const nullifier = BigInt("0x" + crypto.getRandomValues(new Uint8Array(32))
//                 .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""));

//             const input = {
//                 secret: $u.BN256ToBin(secret.toString()).split(""),
//                 nullifier: $u.BN256ToBin(nullifier.toString()).split("")
//             };

//             const res = await fetch("/deposit.wasm");
//             const buffer = await res.arrayBuffer();
//             const depositWC = await wc(buffer);

//             const r = await depositWC.calculateWitness(input, 0);
//             const commitment = r[1];

//             console.log("Generated commitment:", commitment);

//             const tx = await tornadoContract.deposit(commitment, {
//                 value: parseEther("1") // ✅ Correct `parseEther` usage
//             });

//             console.log("Transaction sent:", tx.hash);
//             const receipt = await tx.wait();
//             console.log("Transaction confirmed in block:", receipt.blockNumber);

//         } catch (e) {
//             console.error("Deposit failed:", e);
//         }
//     };

//     return (
//         <div>
//             {
//                 account ? (
//                     <div>
//                         <p>ChainId: {account.chainId}</p>
//                         <p>Wallet Address: {account.address}</p>
//                         <p>Balance: {account.balance} ETH</p>
//                     </div>
//                 ) : (
//                     <button onClick={connectMetamask}>Connect Metamask</button>
//                 )
//             }

//             <hr />

//             {
//                 account ? (
//                     <button onClick={depositEther}>Deposit 1 ETH</button>
//                 ) : (
//                     <p>You need to connect Metamask to use this section.</p>
//                 )
//             }
//         </div>
//     );
// };

// export default InterfaceComponent;


//--------------------
        // try {
        //     const txHash = await window.ethereum.request({ method: "eth_sendTransaction", params: [tx] });
        //     console.log("Transaction Hash:", txHash);
          
        //     // 等待交易确认
        //     let receipt = null;
        //     while (!receipt) {
        //       receipt = await window.ethereum.request({ method: "eth_getTransactionReceipt", params: [txHash] });
        //       await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒轮询
        //     }
        //     console.log("Transaction Receipt:", receipt);
          
        //     // 遍历所有日志，寻找 Deposit 事件
        //     receipt.logs.forEach((log, index) => {
        //       try {
        //         const decodedData = tornadoInterface.decodeEventLog("Deposit", log.data, log.topics);
        //         console.log(`Deposit Event at Log[${index}]:`, decodedData);
        //       } catch (e) {
        //         console.log(`Log[${index}] is not a Deposit event. Error:`, e);
        //       }
        //     });
        //   } catch (e) {
        //     console.error("Transaction Failed:", e);
        //   }