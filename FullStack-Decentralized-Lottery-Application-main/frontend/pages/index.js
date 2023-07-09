import Head from "next/head";
import Image from "next/image";
import EnterLottery from "../components/EnterLottery";
import Navbar from "../components/Navbar";
import ConnectBtn from "../components/subComponents/btns/ConnectBtn";
import Particles from "react-tsparticles";
import tsConfig from '../configs/tsConfig.json'
import { loadFull } from "tsparticles";

export default function Home() {
  const particlesInit = async (main) => {
    console.log(main);
    await loadFull(main);
  };

  return (
    <div className="bg-black min-h-screen">
      <Head>
        <title>Decentralized Lottery</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Particles init={particlesInit} options={tsConfig} />

      <main>
        <Navbar />
        <EnterLottery />
      </main>
    </div>
  );
}
