"use client"

import { SpotlightPreview } from "@/components/SpotlightBackground";
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LucideRefreshCcw, RefreshCcw } from 'lucide-react'

import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'

import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useMemo, useState } from "react";

import '@solana/wallet-adapter-react-ui/styles.css'
import { AirDrop } from "@/components/AirDrop";
import { SolBalance } from "@/components/SolBalance";
import { SendTokens } from "@/components/SendTokens";
import { SignMessage } from "@/components/SignMessage";
import { useRecoilState } from "recoil";
import { sendState, walletConnectState } from "./RecoilContextProvider";
import { toast } from "sonner";
import { CreateTokenMint } from "@/components/CreateTokenMint";

export default function Home() {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  const [send, setSend] = useRecoilState(sendState)
  const [walletConnect, SetWalletConnect] = useRecoilState(walletConnectState)
  const [warn, setWarn] = useState(false)


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect >
        <WalletModalProvider>
          <div className="   right-2 flex justify-end p-3 ">
            <div className=" bg-gradient-to-r from-teal-200 to-purple-700 p-3 rounded-md">
              <SolBalance top={true} />
            </div>
          </div>
          <div className=" home   bg-slate-900 ">
            <SpotlightPreview />
            <div className="  pt-10">
              <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                Best Wallet adapter  <br /> you gonna use
              </h1>
              <div className=" mt-10">
                <div className=" flex justify-center gap-16">
                  <div onClick={() => {
                    console.log("connect clicked! ");
                    SetWalletConnect(true)
                  }}>
                    <WalletMultiButton />
                  </div>
                  <div onClick={() => SetWalletConnect(false)} >
                    <WalletDisconnectButton />
                  </div>
                </div>
                <div className="flex justify-center mt-10 pb-14">
                  <Tabs defaultValue="account" className=" max-w-5xl w-full px-10 flex justify-center flex-col">
                    <TabsList onClick={() => setWarn(true)} className=" sticky top-3 z-[999] bg-black grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 lg:grid-cols-5 px-5 pb-28 md:pb-20 lg:pb-12 pt-2">
                      <TabsTrigger value="AirDrop" className=" text-lg">
                        <div>
                          AirDrop
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="sendSol" className=" text-base md:text-lg lg:text-lg">Send sol</TabsTrigger>
                      <TabsTrigger value="checkSol" className=" text-base md:text-lg lg:text-lg">Check sol</TabsTrigger>
                      <TabsTrigger value="signature" className=" text-base md:text-lg lg:text-lg">Sign a Message</TabsTrigger>
                      <TabsTrigger value="createToken" className=" text-base md:text-lg lg:text-lg">Create Token</TabsTrigger>
                    </TabsList>
                    {warn && <div className={`${walletConnect ? ' hidden' : ''} text-center absolute font-semibold text-white z-[10] left-[38%] mt-10 text-3xl`}>
                      <div className=" p-2 bg-purple-700 rounded-md px-12">
                      Please Connect your <br /> Wallet first
                      </div>
                    </div>}

                    <div className={`${!walletConnect ? 'blur pointer-events-none opacity-60' : ''} transition-all duration-500 relative`}>
                      <TabsContent value="AirDrop"><div>
                        <div className=" bg-custom-gradient  p-3 py-10 rounded-b-md">
                          <div className=" text-2xl font-semibold text-center">
                            AirDrop some tokens
                          </div>
                          <div className=" mt-8 flex justify-center ">
                            <AirDrop />
                          </div>
                        </div>
                      </div></TabsContent>
                      <TabsContent value="sendSol">
                        <div>
                          <div className=" bg-custom-gradient p-3 py-10 rounded-b-md">
                            <div className=" text-2xl font-semibold text-center">
                              Send Some sols another address
                            </div>
                            <div className=" mt-8 flex justify-center ">
                              <SendTokens />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="checkSol">
                        <div>
                          <div className=" bg-custom-gradient  p-3 py-10 rounded-b-md relative">
                            <div className=" text-3xl font-semibold text-center">
                              Check your Sol
                            </div>
                            <div className=" mt-8 flex justify-center ">
                              <SolBalance top={false} />
                            </div>
                            <RefreshCcw onClick={() => {
                              setSend(true);
                            }} className=" cursor-pointer hover:scale-110 transition-all duration-500 absolute left-3 top-2" />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="signature">
                        <div>
                          <div className=" bg-custom-gradient  p-3 py-10 rounded-b-md relative">
                            <div className=" text-3xl font-semibold text-center">
                              Type your message to be signed
                            </div>
                            <div className=" mt-8  ">
                              <SignMessage />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="createToken">
                        <div>
                          <div className=" bg-custom-gradient  p-3 py-10 rounded-b-md relative">
                            <div className=" text-3xl font-semibold text-center">
                              Create Your token mint like USDT and Bonk
                            </div>
                            <div className=" mt-8  ">
                              <CreateTokenMint/>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
              <div>

              </div>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
