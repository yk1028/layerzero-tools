# Layerzero Tools
>  Layerzero를 통한 체인간의 전송 가능한 contract를 쉽게 배포하고 전송 가능한 test tool.

## Supported layerzero contracts
- OFTV2
- NativeOFTV2
- ProxyOFTV2

## Getting start
1. chain.json 생성
2. private key 등록
| 자세한 내용은 아래 configuration 참고
```
npm i -g ts-node
npm i
npm start
```

## Configuration
### Chain info
 - `./src/constants/chain_example.json`을 참고하여 초기 blockchain 정보들을 담은 `./src/constants/chain.json` 생성
 - `chain_example.json`
   ``` json
   {
    "chains": [
      {
        "chain_name": "cube",
        "chain_id": "47",
        "native_symbol": "XPLA",
        "rpc": "https://cube-evm-rpc.xpla.dev/",
        "explorer": "https://explorer.xpla.io/",
        "lz_chain_id": "10216",
        "lz_endpoint": "0x83c73Da98cf733B03315aFa8758834b36a195b87",
        "account_key": "CUBE_KEY",
        "contracts": [ // 기존에 관리하던 contract가 없다면 contracts를 비워두어도 됩니다.
          {
            "address": "0x7d4a974cCdd1b3378005d5D1001fDA8A06D96A2c",
            "type": "OFTV2",
            "dst_chains": [
              "bsc-testnet"
            ]
          },
          {
            "address": "0x1502c32D77F1C35BE049E6F7C74b2fA2034561e6",
            "type": "NativeOFTV2",
            "dst_chains": [
              "bsc-testnet"
            ]
          }
        ]
      },
      {
        "chain_name": "bsc-testnet",
        "chain_id": "97",
        "native_symbol": "tBNB",
        "rpc": "https://bsc-testnet-rpc.publicnode.com",
        "explorer": "https://testnet.bscscan.com/",
        "lz_chain_id": "10102",
        "lz_endpoint": "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1",
        "account_key": "BSC_TESTNET_KEY",
        "contracts": [
          {
            "address": "0x31E88b7960d2d6B97f131be928Ab2878076C8f52",
            "type": "OFTV2",
            "dst_chains": [
              "cube"
            ]
          },
          {
            "address": "0x89F67aCD944Bc3d59c02227ca4BB0b4e3c3450Fe",
            "type": "OFTV2",
            "dst_chains": [
              "cube"
            ]
          }
        ]
      }
      ...
    ]
   }
   ```

### Private key
- `./src/constants/chain.json`에서 지정한 `account_key`로 .env의 private key를 가져오는 방식
- `.env` example
  ```
  CUBE_KEY=["{your cube private key 1}", "{your cube private key 2}"]
  BSC_TESTNET_KEY=["{your bsc-testnet private key 1}", "{your bsc-testnet private key 2}"]
  ```
