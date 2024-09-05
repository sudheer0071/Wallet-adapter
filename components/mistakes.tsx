// import { useConnection, useWallet } from "@solana/wallet-adapter-react"
// import {ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createInitializeAccountInstruction, createInitializeMint2Instruction, createMint, createMintToInstruction, createTransferInstruction, getAccount, getAccountLenForMint, getAssociatedTokenAddress, getMinimumBalanceForRentExemptMint, getMint, getOrCreateAssociatedTokenAccount, MINT_SIZE, TOKEN_PROGRAM_ID, transferInstructionData} from "@solana/spl-token" 
// import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
// import { useEffect, useState } from "react"
// import { toast, Toaster } from "sonner"
// import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base"

// export const CreateTokenMint = ()=>{

  
//   const [mintAddress,setMintAddress] = useState<string|any>('')
//   const [mintBal,setMintBal] = useState<string|any>('')
//   const [showBal, setShowBal] = useState(false)
//   const[mintAdd,setMintAdd] = useState<string|any>('') 
//   const[bal, setBal] = useState<any>('0')
//   const [tokenAccountAddress, setTokenAccountAddress] = useState<string|any>();
//   const[receiverAddress, setReceiverAddress] = useState<string|any>('')
//   const [sendAmount, setSendAmount] = useState<string|any>('')

//   const [amount, setAmount] = useState<number|any>('')
 
//   const wallet = useWallet() ; 
// if (!wallet.publicKey) {
//       console.log('Wallet not connected!');
//       return;
//     }

//   const {connection} = useConnection() 
//   const mintAuthority = wallet.publicKey 
//   const freezeAuthority = wallet.publicKey 
   
  
  
  

//     if (!wallet.publicKey) {
//       console.log('Wallet not connected!');
//       return;
//     }

//   const createToken = async ()=>{ 
//     const id = toast.loading("Creating Token ..")
//     try {
//       console.log(connection,wallet,mintAuthority);
//       const keypair = Keypair.generate();  
//       const lamports = await getMinimumBalanceForRentExemptMint(connection);

          
//         const transaction = wallet.publicKey && mintAuthority && new Transaction().add(
//                 SystemProgram.createAccount({
//                     fromPubkey: wallet.publicKey,
//                     newAccountPubkey: keypair.publicKey,
//                     space: MINT_SIZE,
//                     lamports,
//                     programId:TOKEN_PROGRAM_ID, 
//                 }), 
//                 createInitializeMint2Instruction(keypair.publicKey, 9, mintAuthority, freezeAuthority, TOKEN_PROGRAM_ID), 
//             );
         

//           const signature = transaction && await wallet.sendTransaction(transaction,connection,{
//             signers:[keypair]
//           })
//       signature &&  await connection.confirmTransaction(signature,'confirmed')
//       console.log("Mint Created:", keypair.publicKey.toBase58());
//       setMintAdd(keypair.publicKey)
//       console.log("keypair.pulicKey: ");
//       console.log(keypair.publicKey);
      
//       setMintAddress(keypair.publicKey.toBase58())

//       setShowBal(true)
     
//       toast.dismiss(id)
//       toast.success("Token Minted Successfully!")
//     } catch (error) {
//       console.log(error);
      
//       toast.dismiss(id)
//      toast.error("Error in Minting Tokens ") 
//     }
//   }

//   const mintBalance = async ()=>{
//     console.log("inside mintd ");
//     console.log(mintAdd);
    
//     const mintInfo = wallet.publicKey && await getMint(connection,mintAdd)
//     console.log("mint supply: ");
    
//     console.log(mintInfo?.supply);

//     setMintBal(mintInfo?.supply)
//   }

//   // if(showBal) mintBalance()

// const tokenAccount =  async ()=>{
//   const id = toast.loading("Creating Token Account..")
//   try {
    
//     const keypair = Keypair.generate(); 
//     const mintState = await getMint(connection, mintAdd);
//     const space = getAccountLenForMint(mintState);
  
//     const lamports = await getMinimumBalanceForRentExemptMint(connection);
      
//   const payer = new PublicKey(mintAddress)
 
//   const associatedTokenAddress = mintAuthority && await getAssociatedTokenAddress(
//     payer,
//     mintAuthority,
//     false,
//   )
//   const ataInfo = associatedTokenAddress && await connection.getAccountInfo(associatedTokenAddress);
//   if (ataInfo !== null) {
//     console.log("ATA already exists");toast.dismiss(id)
//     toast.error("Token account already associated with this wallet") 
//     return;
//   }
//   const tokenAccount =  new Transaction().add( 
//     createAssociatedTokenAccountInstruction(
//       //@ts-ignore
//       mintAuthority,
//       associatedTokenAddress,
//       mintAuthority,
//       payer,
//       TOKEN_PROGRAM_ID
//       // lamports,
//     )
//   );   

//   const signature = tokenAccount && await wallet.sendTransaction(tokenAccount,connection)
// signature && await connection.confirmTransaction(signature,'confirmed'); 
//   setTokenAccountAddress(associatedTokenAddress?.toBase58())
//   toast.dismiss(id)
//   toast.success("Token Account Created successffully!")
// } catch (error) {
//   console.log(error);
//   toast.dismiss(id)
//   toast.error("Something went wrong :/") 
// }
// }

// const mintTokens = async()=>{
//   if (amount=='') {
//     toast.warning("Please enter the amount first")
//     return ;
//   } 
//   const id = toast.loading(`Minting ${amount} tokens....`)
//   try {
//     const authority = new PublicKey(mintAddress)
//     const associatedTokenAddress = mintAuthority && await getAssociatedTokenAddress(
//       authority,
//       mintAuthority,
//       false,
//     )

//     const mintTokenss = associatedTokenAddress&& mintAuthority && new Transaction().add(
//       createMintToInstruction(authority,associatedTokenAddress,mintAuthority,amount*1000000000)
//     )

   
//     const signature = mintTokenss && await wallet.sendTransaction(mintTokenss,connection )
// signature &&  await connection.confirmTransaction(signature,'confirmed')

//     console.log("minting tokens .......... ");
    
//     console.log(mintTokenss);
    
//     setBal(amount+amount)
//     toast.dismiss(id)
//    toast.success(`${amount} Tokens Minted successfully`) 
//    setAmount('')
   
//   } catch (error) {
//     console.log(error);
//     toast.dismiss(id)
//     toast.error("Error in Minting Tokens ") 
//   }
// }

// const sendTokens = async () => {
//   if (sendAmount == "" || receiverAddress == "") {
//     toast.warning("Please enter the both feilds ");
//     return;
//   }

//   if (!wallet.publicKey) {
//     return;
//   }

//   const id = toast.loading(`Initiating Transaction...`);

//   try {
//     console.log("Token account..");

//     const mintToken = new PublicKey(mintAddress);
//     const owner = new PublicKey(receiverAddress);
//     console.log("Wallet Public Key:", wallet.publicKey.toBase58());
//     console.log("Connection RPC URL:", connection.rpcEndpoint);

//     console.log("mint address: ");

//     console.log(mintAddress);

//     console.log("receiver address: ");

//     console.log(receiverAddress);
//     if (!mintAuthority) {
//       return;
//     }
//     const associatedTokenFrom = await getAssociatedTokenAddress(
//       mintToken,
//       mintAuthority,
//     );

//     const fromAccount = await getAccount(connection, associatedTokenFrom);

//     const associatedTokenTo = await getAssociatedTokenAddress(
//       mintToken,
//       owner,
//     );
//     console.log("Associated Token Address:", associatedTokenTo.toBase58());
//     const checkTokenAccount =
//       await connection.getAccountInfo(associatedTokenTo);
//     console.log("checking token account...");
//     console.log(checkTokenAccount);
//     console.log("From account...");

//     console.log(associatedTokenFrom);
//     const transaction = new Transaction();
//     if (!(await connection.getAccountInfo(associatedTokenTo))) {
//       console.log("Token account doesn't exist. Creating now...");
//       console.log(wallet.publicKey);
//       transaction.add(
//         createAssociatedTokenAccountInstruction(
//           wallet.publicKey,
//           associatedTokenTo,
//           owner,
//           mintToken,
//         ),
//       );
//     }
//     console.log();
//     transaction.add(
//       createTransferInstruction(
//         fromAccount.address,
//         associatedTokenTo,
//         wallet.publicKey,
//         sendAmount * 1000000000,
//       ),
//     );
//     console.log("Transaction created. Attempting to send...");

//     console.log(transaction); 
//     const signature = await wallet.sendTransaction(transaction, connection);

//     console.log("sending ....");
//     toast.dismiss(id);
//     toast.success(
//       `Sucessfully Sent ${sendAmount} tokens to ${receiverAddress}`,
//     );
//     setReceiverAddress("");
//     setSendAmount("");
//   } catch (error) {
//     console.log(error);

//     toast.dismiss(id);
//     toast.error(`Something went wrong`);
//   }
// };


// // useEffect(()=>{
//   //   mintBalance();
//   // },[mintBal])
  
//   return <div>
//     <Toaster richColors/>
//      <div className=" justify-center flex">
//      <button onClick={createToken} className=" p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500">Mint Tokens</button>
//      </div>
// { mintAddress &&   <div className=" mt-7">
//      <div className=" text-xl font-medium">
//       Mint Supply:  {bal=='0'?0:bal}
//      </div>
//      <div className=" flex">
//      <div >
//     Your token Mint address:
//       <AddressCard value={mintAddress} />
//      </div>
//        <div className=" mt-5">
//        <button onClick={tokenAccount} className=" p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500">Create Token Account</button>
//        <div className=" mt-2">
//     { tokenAccountAddress &&  <AddressCard value = {tokenAccountAddress} />}
//        </div>
//        </div>
//      </div>

//     { tokenAccountAddress &&
//     <div>
//     <div className=" flex justify-center mt-5">
//       <input type="number" value={amount} onChange={(e:any)=>setAmount(e.target.value)} placeholder="Amount" className=" truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md" />
//       <div className="  ">
//            <button onClick={mintTokens} className=" p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500">Add tokens</button> 
//       </div>
   
//       </div>

// <div className=" flex justify-center flex-col items-center mt-10">
//    <div className=" text-2xl font-medium ">
//      Send Tokens
//    </div>
 
//   <div className=" flex justify-center gap-4 mt-4">
//   <div className=" ">
//        <input type="text" value={receiverAddress} onChange={(e:any)=>setReceiverAddress(e.target.value)} placeholder="Enter Reciever's Address" className=" w-96 truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md" />
//       </div>
//       <div className="">
//        <input type="number" value={sendAmount} onChange={(e:any)=>setSendAmount(e.target.value)} placeholder="Amount " className=" p-3 w-40 bg-slate-800 text-white font-medium text-lg rounded-md" />
//       </div>
// <div className=" flex justify-center">
//      <button onClick={sendTokens} className=" p-3  px-4 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500">send</button>
// </div>
//   </div>
// </div>
//     </div>
 
// }
//     </div>}
//   </div>
// }

// const AddressCard = ({value}:any)=>{
//   return <div>
//      <div className=" truncate rounded-md text-sm font-medium text-black bg-purple-200 p-2">    
// {value}
//        </div>
//   </div>
// }