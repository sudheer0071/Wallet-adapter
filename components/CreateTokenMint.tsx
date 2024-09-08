"use client"
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMint2Instruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createTransferInstruction,
  ExtensionType,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  getMint,
  getMintLen,
  LENGTH_SIZE,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import axios from 'axios'
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { R2 } from "@/lib/config";

const { R2_Dev } = process.env
export const CreateTokenMint = () => {

  let allTokens: string[] = []

  const getTokensFromStorage = () => {
    const storedTokens = localStorage.getItem('tokens');
    console.log('Tokens from localStorage:', storedTokens);
    if (!storedTokens) return [];
    return JSON.parse(storedTokens) || [];
  };

  allTokens = getTokensFromStorage();

  //  console.log(allTokens); 
  const [componentKey, setComponentKey] = useState(0);
  const [mintAddress, setMintAddress] = useState<string>("");
  const [mintAdd, setMintAdd] = useState<PublicKey | null>(null);
  const [bal, setBal] = useState<string>("0");
  const [tokenAccountAddress, setTokenAccountAddress] = useState<string>("");
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const [mintName, setMintName] = useState<string>('')
  const [mintSymbol, setMintSymbol] = useState<string>('')
  const [mintImg, setMintImg] = useState<string>('')
  const [mintDesc, setMintDesc] = useState<string>('This Token is generated from Token_2022_Programm on solana')
  const [mintSupply, setMintSupply] = useState<string>('')

  // const [sendAmount, setSendAmount] = useState<string>("");
  const [tokenStates, setTokenStates] = useState<{ [key: number]: { amount: string, receiverAddress: string, sendAmount: string } }>({});
  const [tokens, setTokens] = useState(allTokens);

  const [inputIdx, setInputIdx] = useState(0)
  const [btnIdx, setBtnIdx] = useState(0)

  const wallet = useWallet();
  const mintAuthority = wallet.publicKey;
  const { connection } = useConnection();

  useEffect(() => {
    console.log("inside useEffect...");
    allTokens = getTokensFromStorage()
    if (!wallet.publicKey) {
      console.log("wallet not connected");
    }
    else setTokensInStorage(allTokens)
  }, [allTokens, tokens])

  if (!wallet.publicKey) {
    console.log("Wallet not connected!");
    return null;
  }

  // Helper function to safely parse JSON
  const safeJSONParse = (str: any) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return null;
    }
  };

  // Helper function to safely stringify JSON
  const safeJSONStringify = (obj: any) => {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      console.error('Error stringifying JSON:', e);
      return '';
    }
  };

  const setTokensInStorage = (tokens: any) => {
    const tokenString = safeJSONStringify(tokens);
    localStorage.setItem('tokens', tokenString);
    // console.log('Tokens set in localStorage:', tokenString);
  };

  // localStorage.setItem('tokens',JSON.stringify(tokens))


  const createToken = async () => {
    if (mintName==''||mintSymbol==''||mintImg=='') {
      toast.warning("Please enter all the feilds.")
      return;
    }
    if (!wallet.publicKey) {
      console.log("Wallet not connected!");
      return null;
    }

    const id = toast.loading("Creating Token ..");
    try {
      const keypair = Keypair.generate();


      const signedUrl = await axios.post('/api/sendtoe2', JSON.stringify({ filename: mintName, contentType: 'application/json' }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const url = await signedUrl.data

      await axios.put(url.url, {
        name: mintName,
        symbol: mintSymbol,
        description: mintDesc,
        image: mintImg
      }, {
        headers: {
          "Content-Type": 'application/json'
        }
      })

console.log("uri: "); 
 
console.log(`${R2}/${mintName}.json`);


      const metaData = {
        mint: keypair.publicKey,
        name: mintName,
        symbol: mintSymbol,
        uri: `${R2}/${mintName}.json`,
        additionalMetadata: [],
      }

      const minLen = getMintLen([ExtensionType.MetadataPointer])
      const metaDataLen = TYPE_SIZE* LENGTH_SIZE + pack(metaData).length;
      const lamports = await connection.getMinimumBalanceForRentExemption(minLen + metaDataLen);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: keypair.publicKey,
          space: minLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(keypair.publicKey,wallet.publicKey,keypair.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(keypair.publicKey,9, wallet.publicKey,null,TOKEN_2022_PROGRAM_ID),
        createInitializeInstruction({
          programId:TOKEN_2022_PROGRAM_ID,
          mint:keypair.publicKey,
          metadata:keypair.publicKey,
          name:metaData.name,
          symbol:metaData.symbol,
          uri:metaData.uri,
          mintAuthority:wallet.publicKey,
          updateAuthority:wallet.publicKey,
        })
      );
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.partialSign(keypair);

      const signature = await wallet.sendTransaction(transaction, connection );

      await connection.confirmTransaction(signature, "confirmed");

      setMintAdd(keypair.publicKey);
      //@ts-ignore
      setTokens((prevTokens: string[]) => {
        console.log('Previous tokens:', prevTokens);
        const updatedTokens = [
          ...prevTokens,
          { mintAddress: keypair.publicKey.toBase58(), tokenAccountAddress: '',mintImg, mintName, mintSymbol }
        ];
        console.log('Updated tokens:', updatedTokens);
        setTokensInStorage(updatedTokens);
        return updatedTokens;
      });
      // updateTokens(keypair.publicKey.toBase58())
      // console.log("tokenssssssssssssssss");
      // console.log(tokens);

      setMintAddress(keypair.publicKey.toBase58())
      setComponentKey(prevKey => prevKey + 1);
      setMintName('')
      setMintSymbol('')
      setMintImg('')
      toast.dismiss(id);
      toast.success("Token Minted Successfully!");
    }
    catch (error) {
      console.error("Error creating token:", error);
      toast.dismiss(id);
      toast.error("Error in Minting Tokens");
    }
  };

  const tokenAccount = async (minttt: string) => {
  
    const id = toast.loading("Creating Token Account..");
    if (!wallet.publicKey) {
      console.log("Wallet not connected!");
      return null;
    }

    console.log("mintAdd...");

    console.log(minttt);
    try {
      if (!minttt) throw new Error("Mint address not set");
      const mintt = new PublicKey(minttt)
      const associatedTokenAddress =   getAssociatedTokenAddressSync(
        mintt,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const ataInfo = await connection.getAccountInfo(associatedTokenAddress);
      if (ataInfo !== null) {
        toast.dismiss(id);
        toast.error("Token account already associated with this wallet");
        return;
      }

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAddress,
          wallet.publicKey,
          mintt,
          TOKEN_2022_PROGRAM_ID
        )
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // const ATA = await getAssociatedTokenAddress(mintt,wallet.publicKey, false,TOKEN_2022_PROGRAM_ID)

      // const transaction2 = new Transaction().add(
      //   createMintToInstruction(
      //     mintt,
      //     ATA,
      //     wallet.publicKey,
      //     BigInt(parseFloat(mintSupply) * 1e9),
      //     [],
      //     TOKEN_2022_PROGRAM_ID
      //   )
      // )

      // const signature2 = await wallet.sendTransaction(transaction2,connection)
      // await connection.confirmTransaction(signature2, "confirmed");
      
      setTokens((prevTokens: any) => {
        console.log('Previous tokens:', prevTokens);
        const updatedTokens = prevTokens.map((token: any) =>
          token.mintAddress === mintt.toBase58()
            ? { ...token, bal: (token.bal || 0) + parseFloat(mintSupply), tokenAccountAddress: associatedTokenAddress.toBase58() }
            : token
        );
        console.log('Updated tokens:', updatedTokens);
        setTokensInStorage(updatedTokens);
        return updatedTokens;
      });

      setTokenAccountAddress(associatedTokenAddress.toBase58());
      toast.dismiss(id);
      toast.success("Token Account Created successfully!");
    } catch (error) {
      console.error("Error creating token account:", error);
      toast.dismiss(id);
      toast.error("Something went wrong :/");
    }
  };


  const mintTokens = async (minttt: any) => {
    if (amount === "") {
      toast.warning("Please enter the amount first");
      return;
    }

    if (!wallet.publicKey) {
      console.log("Wallet not connected!");
      return null;
    }


    const id = toast.loading(`Minting ${amount} tokens....`);
    try {

      // console.log(addres?.mintAddress);

      const mintt = new PublicKey(minttt)
      if (!mintt) throw new Error("Mint address not set");
      // console.log(mintt);
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintt,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const mintTokens = new Transaction().add(
        createMintToInstruction(
          mintt,
          associatedTokenAddress,
          wallet.publicKey,
          BigInt(parseFloat(amount) * 1e9),
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const signature = await wallet.sendTransaction(mintTokens, connection);
      await connection.confirmTransaction(signature, "confirmed");


      setTokens((prevTokens: any) => {
        // console.log('Previous tokens:', prevTokens);
        const updatedTokens = prevTokens.map((token: any) =>
          token.mintAddress === mintt.toBase58()
            ? { ...token, bal: (token.bal || 0) + parseFloat(amount) }
            : token
        );
        // console.log('Updated tokens:', updatedTokens);
        setTokensInStorage(updatedTokens);
        return updatedTokens;
      });
      toast.dismiss(id);
      toast.success(`${amount} Tokens Minted successfully`);
      setAmount("");
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      toast.dismiss(id);
      toast.error(`Error in Minting Tokens:${error.message}`);
    }
  };

  const createReceiverAccount = async () => {
    if (!receiverAddress) {
      toast.warning("Please enter the receiver's address first");
      return;
    }

    if (!wallet.publicKey) {
      console.log("Wallet not connected!");
      return null;
    }


    const id = toast.loading("Creating receiver's token account...");
    try {
      if (!mintAdd) throw new Error("Mint address not set");

      const owner = new PublicKey(receiverAddress);
      const associatedTokenTo = await getAssociatedTokenAddress(mintAdd, owner);

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenTo,
          owner,
          mintAdd
        )
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.dismiss(id);
      toast.success("Receiver's token account created successfully!");
    } catch (error) {
      console.error("Error creating receiver's token account:", error);
      toast.dismiss(id);
      toast.error("Failed to create receiver's token account");
    }
  };

  const sendTokens = async (mintt: string) => {
    if (sendAmount == "" || receiverAddress == "") {
      toast.warning("Please enter the both feilds ");
      return;
    }

    if (!wallet.publicKey) {
      return;
    }

    const id = toast.loading(`Initiating Transaction...`);

    try {
      console.log("Token account..");

      const mintToken = new PublicKey(mintt);
      const owner = new PublicKey(receiverAddress);
      if (!mintAuthority) {
        return;
      }
      const associatedTokenFrom =   getAssociatedTokenAddressSync(
        mintToken,
        mintAuthority,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      console.log("receiver: ");
      console.log(receiverAddress);
      
//       const fromAccount = await getAccount(connection, associatedTokenFrom);
//  console.log("fromAccocunt owner");
//  console.log(fromAccount.owner);
 
      console.log("Associated Token Address:", associatedTokenFrom.toBase58());

 
      const associatedTokenTo =   getAssociatedTokenAddressSync(
        mintToken,
        owner,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      const checkTokenAccount =
        await connection.getAccountInfo(associatedTokenTo);
      console.log("checking token account...");
      // console.log(checkTokenAccount);
      // console.log("From account...");

      // console.log(associatedTokenFrom);
      const transaction = new Transaction();
      if (!(await connection.getAccountInfo(associatedTokenTo))) {
        console.log("Token account doesn't exist. Creating now...");
        // console.log(wallet.publicKey);
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedTokenTo,
            owner,
            mintToken,
            TOKEN_2022_PROGRAM_ID
          ),
        );
      }
      transaction.add(
        createTransferInstruction(
          associatedTokenFrom,
          associatedTokenTo,
          wallet.publicKey,
          BigInt(parseFloat(sendAmount) * 1e9),
          [],
          TOKEN_2022_PROGRAM_ID
        ),
      );
      console.log("Transaction created. Attempting to send...");

      // console.log(transaction); 
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed')
      console.log("sending ....");
      toast.dismiss(id);
      toast.success(
        `Sucessfully Sent ${sendAmount} tokens to ${receiverAddress}`,
      );
      toast.dismiss(id);
      setReceiverAddress("");
      setSendAmount("");
    } catch (error: any) {
      console.log(error);
      toast.dismiss(id);
      toast.error(`${error}`);
    }
  };

  // const updateTokens = (minttt:string)=>{
  //   setTokens((prevTokens:string[]) => {
  //     console.log('Previous tokens:', prevTokens);
  //     const updatedTokens = [
  //       ...prevTokens,
  //       { mintAddress: minttt, tokenAccountAddress: '' }
  //     ];
  //     console.log('Updated tokens:', updatedTokens);
  //     setTokensInStorage(updatedTokens);
  //     return updatedTokens;
  //   });
  // }

  return <div >
    <Toaster richColors />
    <div className=" flex flex-col justify-center items-center">
      <div className=" flex gap-4">
        <Inputs label="Token Name" placeholder="eg: NCIKK" value={mintName} onchange={(e:any)=> setMintName(e.target.value)} />
        <Inputs label="Token Symbol" placeholder="eg: NK" value={mintSymbol} onchange={(e:any)=> setMintSymbol(e.target.value)} />
        <Inputs label="Image url" placeholder="eg: favicon.com/img.jpb" value={mintImg} onchange={(e:any)=> setMintImg(e.target.value)} />
        {/* <Inputs label="Initial Supply" placeholder="eg: 100" value={mintSupply} onchange={(e)=> setMintSupply(e.target.value)} /> */}
   
      </div>
    <div className=" flex justify-center mt-3">
      <button
        onClick={createToken}
        className="p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500"
        >
        Create Tokens
      </button>
        </div>
    </div>
    {/* {allTokens.map((token)=><div>{token.mintAddress} <br /> {token.tokenAccountAddress}</div>)} */}

    {/* allTokens will not work here because its not a state variable !!!!!!!!!! */}

    {tokens.length != 0 && (
      tokens.map((token: any, idx: number) => (
        <div key={idx} className="mt-10  bg-gradient-to-r rounded-md from-purple-400 to-purple-900 border-purple-400 py-5 shadow-xl p-2 px-4  shadow-gray-700 ">
          <div className="flex flex-col">
            <div>
              <div className=" flex gap-5 justify-center">
                <div className="text-xl font-medium p-2 bg-gradient-to-r rounded-md from-purple-500 to-teal-800 text-white">
                  Mint Supply : <div className=" inline font-mono text-2xl text-teal-300">{!token.bal ? 0 : token.bal}</div>
                </div>
                <div className=" flex gap-3 bg-gradient-to-r  from-slate-400 to-teal-800 rounded-md p-1 px-2">
                  <div>
                   <img width={50} src={token.mintImg} alt={token.mintName} className=" rounded-full" />
                  </div>
                  <div>
                  <div className=" text-2xl font-medium text-slate-300">
                     {token.mintName}
                  </div>
                  <div className=" text-center text-slate-900">
                    {token.mintSymbol}
                  </div>
                  </div>
                </div>
                
                <div className=" flex gap-7 bg-purple-600 rounded-md p-2">
                  <div className=" text-white text-xl">
                    Mint address :
                  </div>
                  <div className=" -ml-5">
                    <AddressCard small={true} value={token.mintAddress} />
                  </div>
                </div>

              </div>
            </div>
            <div className="mt-5 ">
              <div className=" flex justify-center">
                <button
                  onClick={() => tokenAccount(token.mintAddress)}
                  className="p-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500 "
                >
                  Create Token Account
                </button>
              </div>
              {token.tokenAccountAddress && (
                <div>
                  <div className=" mt-4 text-xl font-medium">
                    Token account Address :
                  </div>
                  <div className="mt-2">
                    <AddressCard value={token.tokenAccountAddress} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {token.tokenAccountAddress && (
            <div>
              <div className="flex justify-center mt-5">
                <input
                  type="number"
                  value={inputIdx == idx ? amount : ''}
                  onChange={(e) => {
                    setInputIdx(idx); setBtnIdx(idx);
                    setAmount(e.target.value)
                  }}
                  placeholder="Amount"
                  className="truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md"
                />
                <div>
                  <button
                    onClick={() => {
                      // console.log("btnIdx = ",btnIdx);
                      // console.log("idx = ",idx);

                      btnIdx == idx ? mintTokens(token.mintAddress) : null
                    }}
                    className="p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500"
                  >
                    Add tokens
                  </button>
                </div>
              </div>

              {token.bal && (
                <div className="flex justify-center flex-col items-center mt-10">
                  <div className="text-2xl font-medium">Send Tokens</div>
                  <div className="flex justify-center gap-4 mt-4">
                    <div>
                      <input
                        type="text"
                        value={inputIdx == idx ? receiverAddress : ''}
                        onChange={(e) => { setInputIdx(idx); setBtnIdx(idx); setReceiverAddress(e.target.value) }}
                        placeholder="Enter Receiver's Address"
                        className="w-96 truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={inputIdx == idx ? sendAmount : ''}
                        onChange={(e) => { setInputIdx(idx); setBtnIdx(idx); setSendAmount(e.target.value) }}
                        placeholder="Amount"
                        className="p-3 w-40 bg-slate-800 text-white font-medium text-lg rounded-md"
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => sendTokens(token.mintAddress)}
                        className="p-3 px-4 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))
    )}
  </div>
};

const AddressCard = ({ value,small }: { value: string,small?:boolean }) => {
  return (
    <div>
      <div className={` ${small?' w-60':''} truncate rounded-md text-sm font-medium text-black bg-purple-300 p-2`}>
        {value}
      </div>
    </div>
  );
};

const Inputs = ({label,value, placeholder, onchange,}:{label:string,value:string,placeholder:string,onchange:any})=>{
  return <div>
  <div>
  <label htmlFor={label}>{label}</label>
<div>
  <input value={value} onChange={onchange} placeholder={placeholder} type="text" className={` ${label.includes('Symbol')?' w-32':label.includes('Supply')?' w-32':''} truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md`} />
</div>
</div>
  </div>
}