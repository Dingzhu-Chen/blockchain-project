## 目录

- [DApp功能概述](#DApp功能概述)
- [使用方法和流程](#使用方法和流程)

## DApp功能概述
1. 匿名存款
功能描述
用户生成 secret 和 nullifier，计算 commitment 并存入 Merkle 树，确保存款过程匿名。

<span style="color:gray; font-weight:bold;">对应代码文件</span>
<strong><span style="color:gray;">灰色加粗文本</span></strong>

commitment_hasher.circom：生成 commitment 和 nullifierHash。

Tornado.sol：处理存款逻辑，更新 Merkle 树根。

interface.js：前端生成随机值并调用合约存款函数。

2. 匿名取款
功能描述
用户提供零知识证明，证明其拥有有效的 secret 和 nullifier，合约验证后执行提款。

<span style="color:gray; font-weight:bold;">对应代码文件</span>

withdraw.circom：零知识证明电路，验证 Merkle 树路径和 nullifierHash。

Tornado.sol：验证证明并执行提款。

interface.js：前端生成证明并调用提款函数。

3. 防止重复取款
功能描述
通过记录已使用的 nullifierHash，确保每个提款操作只能执行一次。

<span style="color:gray; font-weight:bold;">对应代码文件</span>

Tornado.sol：使用 nullifierHashes 映射记录已使用的无效符哈希。

总结
该 DApp 实现了匿名存款、匿名取款和防重复取款功能，主要依赖以下技术：

零知识证明（Groth16 协议）确保隐私性。

Merkle 树管理存款承诺。

无效符哈希防止双花攻击。

<span style="color:gray; font-weight:bold;">对应代码文件</span>

核心逻辑：Tornado.sol

电路设计：commitment_hasher.circom, withdraw.circom

前端交互：interface.js

## 使用方法和流程

首先在backend目录开启npx hardhat node

<img src="https://github.com/user-attachments/assets/569dd953-e6a6-469c-a946-c9fdb89b7e4c" width="39%">

然后用脚本deploy.js部署三个合约

<img src="https://github.com/user-attachments/assets/d5a3e032-2024-4abc-88ea-aa8bd0bddb9a" width="39%">

部署完成后把Tornado的地址更新到前端interface.js

<img src="https://github.com/user-attachments/assets/75ddd787-5b31-4ed7-a814-e80d6d26a20e" width="39%">

开启前端

<img src="https://github.com/user-attachments/assets/1400fa30-1c8a-4360-8207-3d696d456c62" width="39%">

在Metamask上查看hardhat本地账户，我用私钥添加了两个账户，如图所示，分别是account4和account5

<img src="https://github.com/user-attachments/assets/ac048cbf-bde5-4efd-8021-93e5590b2bdf" width="39%">

前端的网页比较简陋，初始只有一个按钮用来连接本DApp和Metamask账户

<img src="https://github.com/user-attachments/assets/f31927f5-5acd-4e94-ab0a-75ba527659fe" width="39%">

当按下按钮时，本DApp会自动连接Metamask账户并显示钱包账户地址和余额

<img src="https://github.com/user-attachments/assets/58fa9357-6be5-49c5-803f-6929b5d78c81" width="39%">

当按下“Deposit i ETH”后，钱包会自动跳出交易请求界面

<img src="https://github.com/user-attachments/assets/220086ff-616b-46da-bdf4-abae4f7b48ea" width="39%">


在钱包上确认后，DApp会返回一串存款字符串，同时account4界面会显示消费了1ETH

<img src="https://github.com/user-attachments/assets/7691a382-7a79-4367-9867-ad60e6f426e8" width="49%">


<img src="https://github.com/user-attachments/assets/5b1835bd-7afd-472f-a1d1-4ecda6b9e3ab" width="29%">


复制该字符串，在metamask中将account4切换成account5, 刷新DApp界面，连接account5, 将存款字符串黏贴到输入框

<img src="https://github.com/user-attachments/assets/f1e1c115-9f66-4e0d-8ce9-e54818c9d007" width="39%">


点击取款按钮Withdraw 1 ETH后， Metamask会跳出取款交易界面

<img src="https://github.com/user-attachments/assets/1a3e6b80-e911-4318-8b1c-2477ca2195d0" width="39%">

点击确认，Metamask会显示交易成功，account5的余额会从原来的100000ETH变成100001ETH，浏览器console也会返回相应信息

<img src="https://github.com/user-attachments/assets/cf70036e-d215-4abc-af03-c5b20f0e8eff" width="39%">












