"use client"

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { CameraOff, Loader2, ScanLine } from "lucide-react"

export interface UpiTarget {
  vpa?: string
  name?: string
  amount?: number
  raw: string
}

function parseUpi(raw: string): UpiTarget {
  try {
    if (raw.toLowerCase().startsWith("upi://") || raw.includes("pa=")) {
      const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : raw
      const params = new URLSearchParams(query)
      const amt = params.get("am")
      return {
        vpa: params.get("pa") ?? undefined,
        name: params.get("pn") ?? undefined,
        amount: amt ? Number(amt) : undefined,
        raw,
      }
    }
  } catch {
    // fall through to treating the payload as plain text
  }
  return { name: raw, raw }
}

export function QrScanner({ onDetected }: { onDetected: (target: UpiTarget) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected

  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    function scanFrame() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        const w = video.videoWidth
        const h = video.videoHeight
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h)
          const image = ctx.getImageData(0, 0, w, h)
          const code = jsQR(image.data, w, h, { inversionAttempts: "dontInvert" })
          if (code && code.data) {
            onDetectedRef.current(parseUpi(code.data))
            return
          }
        }
      }
      rafRef.current = requestAnimationFrame(scanFrame)
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser does not support camera access.")
        setStatus("error")
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.setAttribute("playsinline", "true")
        await video.play()
        setStatus("scanning")
        rafRef.current = requestAnimationFrame(scanFrame)
      } catch (err) {
        const name = err instanceof DOMException ? err.name : ""
        if (name === "NotAllowedError" || name === "SecurityError") {
          setError("Camera permission was blocked. Allow camera access, or enter details manually below.")
        } else if (name === "NotFoundError") {
          setError("No camera found on this device. Enter the payment details manually below.")
        } else {
          setError("Unable to start the camera. Enter the payment details manually below.")
        }
        setStatus("error")
      }
    }

    start()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          aria-label="Camera preview for QR scanning"
        />
        <canvas ref={canvasRef} className="hidden" />

        {status === "scanning" && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative size-3/5">
                <span className="absolute left-0 top-0 size-6 rounded-tl-lg border-l-4 border-t-4 border-white/90" />
                <span className="absolute right-0 top-0 size-6 rounded-tr-lg border-r-4 border-t-4 border-white/90" />
                <span className="absolute bottom-0 left-0 size-6 rounded-bl-lg border-b-4 border-l-4 border-white/90" />
                <span className="absolute bottom-0 right-0 size-6 rounded-br-lg border-b-4 border-r-4 border-white/90" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/40 py-2 text-xs font-medium text-white">
              <ScanLine className="size-4" />
              Point at a UPI QR code
            </div>
          </>
        )}

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Starting camera…</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white/85">
            <CameraOff className="size-7" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
