import { ImageResponse } from "next/og";
import { getRecentYoinkers, getTotalYoinks } from "../../lib/contract";

export const alt = "yoink the flag";
export const size = {
  width: 1260,
  height: 660,
};

export const contentType = "image/png";
export const revalidate = 60;

export default async function Image() {
  const totalYoinks = await getTotalYoinks();
  const yoinkers = await getRecentYoinkers(10);

  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex flex-col justify-center items-center relative"
        style={{
          backgroundImage: "url(https://yoink.party/frame.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div tw="flex flex-col items-center p-12 rounded-xl">
          <div tw="flex flex-row mt-[240px]">
            {yoinkers.map((user, i) => (
              <div
                key={i}
                tw="flex overflow-hidden rounded-full h-28 w-28 border-4 border-[#FDF6F5] bg-[#FDF6F5] -ml-12 first:ml-0"
              >
                {user.pfpUrl && (
                  <img
                    src={user.pfpUrl}
                    tw="object-cover w-full h-full"
                    alt={user.username}
                  />
                )}
              </div>
            ))}
          </div>
          <div tw="flex text-4xl">
            <span tw="mr-2">{totalYoinks}</span> yoinks
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
