"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

import Flag from "../../public/flag_simple.png";
import FlagAvatar from "../../public/flag.png";
import { WagmiProvider } from "../WagmiProvider";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { RecentActivity } from "./RecentActivity";
import { revalidateFramesV2 } from "./actions";
import { YoinkButton } from "../components/YoinkButton";

export default function Yoink(props: {
  lastYoinkedBy: string;
  pfpUrl?: string;
  totalYoinks: string;
}) {
  return (
    <WagmiProvider>
      <YoinkInner {...props} />
    </WagmiProvider>
  );
}

function YoinkInner(props: {
  lastYoinkedBy: string;
  pfpUrl?: string;
  totalYoinks: string;
}) {
  return <YoinkStart {...props} />;
}

function YoinkStart({
  lastYoinkedBy,
  pfpUrl,
  totalYoinks,
}: {
  lastYoinkedBy: string;
  pfpUrl?: string;
  totalYoinks: string;
}) {
  const router = useRouter();
  const account = useAccount();
  const { data: hash } = useSendTransaction();
  const txReceiptResult = useWaitForTransactionReceipt({ hash });
  const [timeLeft, setTimeLeft] = useState<number>();
  const pfp = pfpUrl ?? FlagAvatar;

  const init = useCallback(async () => {
    sdk.actions.ready();
  }, []);

  useEffect(() => {
    if (!pfp) {
      void init();
    }
  }, [init, pfp]);

  useEffect(() => {
    sdk.on("primaryButtonClicked", () => {
      setTimeLeft(undefined);
    });
    return () => {
      sdk.off("primaryButtonClicked", () => {
        setTimeLeft(undefined);
      });
    };
  }, []);

  useEffect(() => {
    if (txReceiptResult.isLoading) {
      setTimeLeft(undefined);
    }
  }, [txReceiptResult.isLoading]);

  useEffect(() => {
    if (txReceiptResult.isSuccess) {
      void revalidateFramesV2();
      router.push(`/framesV2/yoinked?address=${account.address}`);
    }
  }, [account.address, router, txReceiptResult.isSuccess]);

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      alert(`Error: ${error}`);
    }
  }, []);

  const isWarpcastUsername = (username: string) => !username.includes("…");

  const handleProfileClick = useCallback(() => {
    sdk.actions.openUrl(`https://warpcast.com/${lastYoinkedBy}`);
  }, [lastYoinkedBy]);

  if (typeof timeLeft === "number") {
    return (
      <div className="mt-3 p-3">
        <TimeLeft timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
      </div>
    );
  }

  return (
    <div className="p-3 pt-9 flex flex-col items-center h-[100vh] justify-between">
      <div></div>
      <div className="pb-8 px-8 flex flex-col items-center">
        <div className="relative mb-1">
          <div className="flex overflow-hidden rounded-full h-[112px] w-[112px]">
            <Image
              src={pfpUrl ?? FlagAvatar}
              className="w-full h-full object-cover object-center"
              onLoadingComplete={init}
              alt="avatar"
              width="112"
              height="112"
            />
          </div>
          <div className="absolute right-0 bottom-0 flex items-center justify-center bg-[#F7F7F7] border border-[#F5F3F4] rounded-full h-[36px] w-[36px]">
            <Image src={Flag} width={14.772} height={19.286} alt="yoink flag" />
          </div>
        </div>
        {txReceiptResult.isLoading || txReceiptResult.isSuccess ? (
          <div className="text-center text-2xl font-black text-[#BA181B]">
            <div>Yoinking the flag from</div>
            <div>
              <span className="inline-block animate-spin">🚩</span>{" "}
              <span className="animate-pulse">{lastYoinkedBy}</span>{" "}
              <span className="inline-block animate-spin">🚩</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex text-2xl font-black text-[#BA181B] uppercase mb-1">
              Yoink!
            </div>
            <div className="mb-1 font-bold text-sm text-center">
              {lastYoinkedBy} has the flag
            </div>
            {/* isWarpcastUsername(lastYoinkedBy) && (
              <button
                onClick={handleProfileClick}
                className="my-4 px-4 py-2 bg-[#BA181B] text-white rounded-lg hover:bg-[#A11518] transition-colors duration-200 text-sm font-semibold"
              >
                View Profile
              </button>
            ) */}
            <div className="text-sm">
              The flag has been yoinked{" "}
              <span className="text-[#BA181B]">{totalYoinks} times</span>
            </div>
          </>
        )}
      </div>
      <RecentActivity />
      <div className="flex flex-col grow"></div>
      <div
        className="rounded-lg text-sm font-semibold bg-slate-200 py-3 w-full text-center"
        onClick={addFrame}
      >
        Add Frame
      </div>
      <div className="mt-4 w-full">
        <YoinkButton
          onTimeLeft={setTimeLeft}
          onYoinkSuccess={() => {
            void revalidateFramesV2();
            router.push(`/framesV2/yoinked?address=${account.address}`);
          }}
        />
      </div>
    </div>
  );
}

function TimeLeft({
  timeLeft,
  setTimeLeft,
}: {
  timeLeft: number;
  setTimeLeft: (v: number) => void;
}) {
  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [setTimeLeft, timeLeft]);

  if (timeLeft === 0) {
    return (
      <>
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold mb-1">it&apos;s time to</div>
          <div className="text-7xl font-black text-[#BA181B] uppercase">
            YOINK!
          </div>
        </div>
        <YoinkButton onTimeLeft={setTimeLeft} />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-bold mb-1">🐎 hold yer horses</div>
      <div className="text-7xl font-black text-[#BA181B] uppercase mb-1 font-mono">
        {formatTime(timeLeft)}
      </div>
      <div className="text-sm font-semibold">before you can yoink again</div>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Pad each component to ensure two digits
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
