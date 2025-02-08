首先再backend目录开启npx hardhat node
<img src="https://github.com/user-attachments/assets/569dd953-e6a6-469c-a946-c9fdb89b7e4c" width="50%">

然后用脚本deploy.js部署三个合约
![5ce918b1796e9cce8f4e84af1f7b09d](https://github.com/user-attachments/assets/d5a3e032-2024-4abc-88ea-aa8bd0bddb9a)

部署完成后把Tornado的地址更新到前端interface.js
![d1e6d8a69cf4bc33b3ce881d962a245](https://github.com/user-attachments/assets/75ddd787-5b31-4ed7-a814-e80d6d26a20e)

开启前端
![2eef722990c43ae31f7d81f5b80c25c](https://github.com/user-attachments/assets/1400fa30-1c8a-4360-8207-3d696d456c62)

在Metamask上查看hardhat本地账户，我用私钥添加了两个账户，如图所示，分别是account4和account5
![eb92e563aa279deaa81b53ba3039d22](https://github.com/user-attachments/assets/ac048cbf-bde5-4efd-8021-93e5590b2bdf)

前端的网页比较简陋，初始只有一个按钮用来连接本DApp和Metamask账户
![5cd32555faa0c04b96edf1794bce0b9](https://github.com/user-attachments/assets/f31927f5-5acd-4e94-ab0a-75ba527659fe)

当按下按钮时，本DApp会自动连接Metamask账户并显示钱包账户地址和余额
![d1f8e4b7285bb43dc81f3d8343e1ab0](https://github.com/user-attachments/assets/58fa9357-6be5-49c5-803f-6929b5d78c81)

当按下“Deposit i ETH”后，钱包会自动跳出交易请求界面
![0d4de61538c65216fe946eb692e32e2](https://github.com/user-attachments/assets/220086ff-616b-46da-bdf4-abae4f7b48ea)

在钱包上确认后，DApp会返回一串存款字符串
![254a78260ce094797f016e9c9bfb807](https://github.com/user-attachments/assets/7691a382-7a79-4367-9867-ad60e6f426e8)

















