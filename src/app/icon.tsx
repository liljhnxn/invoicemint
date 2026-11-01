import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #9333ea 0%, #10b981 100%)",
          borderRadius: "7px",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: "15px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.5px",
        }}
      >
        IM
      </div>
    ),
    {
      ...size,
    }
  );
}

