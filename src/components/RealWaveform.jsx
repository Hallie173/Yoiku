import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function RealWaveform({
  audioUrl,
  color = "#3b82f6",
  playbackTime = 0,
  maxDuration = 30,
  onDurationLoad,
}) {
  const canvasRef = useRef(null);
  const [peaks, setPeaks] = useState([]);
  const [isDecoding, setIsDecoding] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState(0);

  const onDurationLoadRef = useRef(onDurationLoad);
  useEffect(() => {
    onDurationLoadRef.current = onDurationLoad;
  }, [onDurationLoad]);

  useEffect(() => {
    let audioCtx = null;
    let isMounted = true;

    const fetchAndDecode = async () => {
      if (!audioUrl) return;
      setIsDecoding(true);
      setHasError(false);

      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error("Không tìm thấy file audio");

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const rawData = audioBuffer.getChannelData(0);

        const trackDur = audioBuffer.duration;
        if (isMounted) {
          setDuration(trackDur);
          if (onDurationLoadRef.current) onDurationLoadRef.current(trackDur);
        }

        const SAMPLES = 150;
        const blockSize = Math.floor((rawData?.length || 0) / SAMPLES);
        const compressedPeaks = [];

        if (blockSize > 0) {
          for (let i = 0; i < SAMPLES; i++) {
            let blockStart = blockSize * i;
            let max = 0;
            for (let j = 0; j < blockSize; j++) {
              const amplitude = Math.abs(rawData[blockStart + j] || 0);
              if (amplitude > max) max = amplitude;
            }
            compressedPeaks.push(max);
          }
        }

        if (isMounted) setPeaks(compressedPeaks);
      } catch (error) {
        console.error("Lỗi sóng âm:", error.message);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsDecoding(false);
        if (audioCtx) audioCtx.close();
      }
    };

    fetchAndDecode();
    return () => {
      isMounted = false;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (
      !peaks ||
      !Array.isArray(peaks) ||
      peaks.length === 0 ||
      !canvasRef.current
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / peaks.length) * 0.7;
    const gap = (width / peaks.length) * 0.3;

    peaks.forEach((peak, index) => {
      const barHeight = Math.min(peak * height * 1.5, height);
      const x = index * (barWidth + gap);
      const y = (height - barHeight) / 2;

      // ĐÃ SỬA: Bỏ phép chia lấy dư, so sánh trực tiếp với playbackTime
      const barTime = (index / peaks.length) * duration;
      const isPlayed = barTime <= playbackTime;

      ctx.fillStyle = color;
      ctx.globalAlpha = isPlayed ? 1.0 : 0.4;

      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 20);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    });
  }, [peaks, color, playbackTime, duration]);

  if (hasError) {
    return (
      <div className="absolute top-2 bottom-2 left-0 right-0 flex items-center justify-center bg-black/50 text-white/50 rounded-md border border-destructive/50">
        <AlertCircle className="w-4 h-4 text-destructive mr-2" />
        <span className="text-[10px]">Lỗi tải File</span>
      </div>
    );
  }

  const widthPercent = maxDuration > 0 ? (duration / maxDuration) * 100 : 100;

  return (
    <div
      className="absolute top-2 bottom-2 rounded-md border border-white/10 shadow-sm flex items-center justify-center overflow-hidden pointer-events-auto bg-black/40 backdrop-blur-sm transition-all duration-300"
      style={{ left: 0, width: `${widthPercent}%` }}
    >
      {isDecoding && (
        <div className="absolute z-10 bg-black/50 p-2 rounded-full backdrop-blur-sm">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full"
      />
    </div>
  );
}
