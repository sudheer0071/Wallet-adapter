import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  getMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export const CreateTokenMint = () => {
  const [mintAddress, setMintAddress] = useState<string>("");
  const [mintAdd, setMintAdd] = useState<PublicKey | null>(null);
  const [bal, setBal] = useState<string>("0");
  const [tokenAccountAddress, setTokenAccountAddress] = useState<string>("");
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tokenStates, setTokenStates] = useState<{ [key: number]: { amount: string, receiverAddress: string, sendAmount: string } }>({});
  const [tokens, setTokens] = useState([]);

  const [inputIdx, setInputIdx] = useState(0)
  const [btnIdx, setBtnIdx] = useState(0)

  const wallet = useWallet();
  const mintAuthority = wallet.publicKey;
  const { connection } = useConnection();

  const handleInputChange = (idx: number, field: string, value: string) => {
    setTokenStates((prevState) => ({
      ...prevState,
      [idx]: {
        ...prevState[idx],
        [field]: value,
      },
    }));
  };

  if (!wallet.publicKey) {
    console.log("Wallet not connected!");
    return null;
  }
 
  // Helper function to safely parse JSON
const safeJSONParse = (str:any) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
};

// Helper function to safely stringify JSON
const safeJSONStringify = (obj:any) => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    console.error('Error stringifying JSON:', e);
    return '';
  }
};

// Helper function to safely get tokens from localStorage
const getTokensFromStorage = () => {
  const storedTokens = localStorage.getItem('tokens');
  // console.log('Tokens from localStorage:', storedTokens);
  return safeJSONParse(storedTokens) || [];
};



// Helper function to safely set tokens in localStorage
const setTokensInStorage = (tokens:any) => {
  const tokenString = safeJSONStringify(tokens);
  localStorage.setItem('tokens', tokenString);
  console.log('Tokens set in localStorage:', tokenString);
};

  // localStorage.setItem('tokens',JSON.stringify(tokens))

  let allTokens:any = []

  allTokens =  getTokensFromStorage()
   console.log(allTokens); 
 

  const createToken = async () => {
    if (!wallet.publicKey) {
      console.log("Wallet not connected!");
      return null;
    }
  
    const id = toast.loading("Creating Token ..");
    try {
      const keypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: keypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          keypair.publicKey,
          9,
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await wallet.sendTransaction(transaction, connection, {
        signers: [keypair],
      });
      await connection.confirmTransaction(signature, "confirmed");

      setMintAdd(keypair.publicKey);
      setTokens((prevTokens) => {
        console.log('Previous tokens:', prevTokens);
        const updatedTokens = [
          ...prevTokens,
          { mintAddress: keypair.publicKey.toBase58(), tokenAccountAddress: '' }
        ];
        console.log('Updated tokens:', updatedTokens);
        setTokensInStorage(updatedTokens);
        return updatedTokens;
      });
      console.log("tokenssssssssssssssss");
      console.log(tokens);
      
      
      setMintAddress(keypair.publicKey.toBase58())
      toast.dismiss(id);
      toast.success("Token Minted Successfully!");
    } catch (error) {
      console.error("Error creating token:", error);
      toast.dismiss(id);
      toast.error("Error in Minting Tokens");
    }
  };

  const tokenAccount = async () => {
    const id = toast.loading("Creating Token Account..");
    if (!wallet.publicKey) {
      console.log("Wallet not connected!");
      return null;
    }
  
    try {
      if (!mintAdd) throw new Error("Mint address not set");

      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintAdd,
        wallet.publicKey
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
          mintAdd
        )
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
 
      setTokens(prevTokens => {
        console.log('Previous tokens:', prevTokens);
        const updatedTokens = prevTokens.map(token => 
          token.mintAddress === mintAdd.toBase58() 
            ? { ...token, tokenAccountAddress: associatedTokenAddress.toBase58() }
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
 

  const mintTokens = async () => {
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
      if (!mintAdd) throw new Error("Mint address not set");

      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintAdd,
        wallet.publicKey
      );

      const mintTokens = new Transaction().add(
        createMintToInstruction(
          mintAdd,
          associatedTokenAddress,
          wallet.publicKey,
          BigInt(parseFloat(amount) * 1e9)
        )
      );

      const signature = await wallet.sendTransaction(mintTokens, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setBal((prevBal) => (parseFloat(prevBal) + parseFloat(amount)).toString());
      toast.dismiss(id);
      toast.success(`${amount} Tokens Minted successfully`);
      setAmount("");
    } catch (error) {
      console.error("Error minting tokens:", error);
      toast.dismiss(id);
      toast.error("Error in Minting Tokens");
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

  const sendTokens = async () => {
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
  
      const mintToken = new PublicKey(mintAddress);
      const owner = new PublicKey(receiverAddress);
      console.log("Wallet Public Key:", wallet.publicKey.toBase58());
      console.log("Connection RPC URL:", connection.rpcEndpoint);
  
      console.log("mint address: ");
  
      console.log(mintAddress);
  
      console.log("receiver address: ");
  
      console.log(receiverAddress);
      if (!mintAuthority) {
        return;
      }
      const associatedTokenFrom = await getAssociatedTokenAddress(
        mintToken,
        mintAuthority,
      );
  
      const fromAccount = await getAccount(connection, associatedTokenFrom);
  
      const associatedTokenTo = await getAssociatedTokenAddress(
        mintToken,
        owner,
      );
      console.log("Associated Token Address:", associatedTokenTo.toBase58());
      const checkTokenAccount =
        await connection.getAccountInfo(associatedTokenTo);
      console.log("checking token account...");
      console.log(checkTokenAccount);
      console.log("From account...");
  
      console.log(associatedTokenFrom);
      const transaction = new Transaction();
      if (!(await connection.getAccountInfo(associatedTokenTo))) {
        console.log("Token account doesn't exist. Creating now...");
        console.log(wallet.publicKey);
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedTokenTo,
            owner,
            mintToken,
          ),
        );
      }
      console.log();
      transaction.add(
        createTransferInstruction(
          fromAccount.address,
          associatedTokenTo,
          wallet.publicKey,
          BigInt(parseFloat(sendAmount) * 1e9)
        ),
      );
      console.log("Transaction created. Attempting to send...");
  
      console.log(transaction); 
      const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature,'confirmed')
      console.log("sending ....");
      toast.dismiss(id);
      toast.success(
        `Sucessfully Sent ${sendAmount} tokens to ${receiverAddress}`,
      );
      toast.dismiss(id);
      setReceiverAddress("");
      setSendAmount("");
    } catch (error:any) {
      console.log(error);
      toast.dismiss(id);
      toast.error(`${error.message}`);
    }
  };
  
  return (
    <div>
      <Toaster richColors />
      <div className="justify-center flex">
        <button
          onClick={createToken}
          className="p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500"
        >
          Mint Tokens
        </button>
      </div>
      {/* {allTokens.map((token)=><div>{token.mintAddress} <br /> {token.tokenAccountAddress}</div>)} */}
     
      {allTokens.length !== 0 && (
    allTokens.map((token: any, idx: number) => (
      <div key={idx} className="mt-7 rounded-xl py-5 shadow-xl p-2 border-1 shadow-gray-700 ">
        <div className="flex flex-col">
          <div> 
        <div className="text-xl font-medium">
          Mint Supply: {bal === "0" ? 0 : bal}
        </div>
            Your token Mint address:
            <AddressCard value={token.mintAddress} />
          </div>
          <div className="mt-5">
            <button
              onClick={tokenAccount}
              className="p-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500"
            >
              Create Token Account
            </button>
            <div className="mt-2">
              {token.tokenAccountAddress && (
                <AddressCard value={token.tokenAccountAddress} />
              )}
            </div>
          </div>
        </div>

        {token.tokenAccountAddress && (
          <div>
            <div className="flex justify-center mt-5">
              <input
                type="number"
                value={inputIdx==idx?amount:''}
                onChange={(e) => { 
                  console.log("inside amount input idx");
                  
                  console.log(idx);
                  
                  console.log("inside amount input Inputidx");
                  
                  console.log(inputIdx);

                  setInputIdx(idx);setBtnIdx(idx);
                   setAmount(e.target.value)}}
                placeholder="Amount"
                className="truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md"
              />
              <div>
                <button
                  onClick={()=> {
                    console.log("btnIdx = ",btnIdx);
                    console.log("idx = ",idx);
                    
                    btnIdx == idx ? mintTokens():null}}
                  className="p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500"
                >
                  Add tokens
                </button>
              </div>
            </div>

            {bal !== '0' && (
              <div className="flex justify-center flex-col items-center mt-10">
                <div className="text-2xl font-medium">Send Tokens</div>
                <div className="flex justify-center gap-4 mt-4">
                  <div>
                    <input
                      type="text"
                      value={tokenStates[idx]?.receiverAddress || ''}
                      onChange={(e) => handleInputChange(idx, 'receiverAddress', e.target.value)}
                      placeholder="Enter Receiver's Address"
                      className="w-96 truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={tokenStates[idx]?.sendAmount || ''}
                      onChange={(e) => handleInputChange(idx, 'sendAmount', e.target.value)}
                      placeholder="Amount"
                      className="p-3 w-40 bg-slate-800 text-white font-medium text-lg rounded-md"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={sendTokens}
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
  );
};

const AddressCard = ({ value }: { value: string }) => {
  return (
    <div>
      <div className="truncate rounded-md text-sm font-medium text-black bg-purple-300 p-2">
        {value}
      </div>
    </div>
  );
};