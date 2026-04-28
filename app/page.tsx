"use client";

import { useMemo, useState } from "react";

export default function TradingLevelsCalculator() {
  const [rangeHigh, setRangeHigh] = useState<string>("");
  const [rangeLow, setRangeLow] = useState<string>("");
  const [instrument, setInstrument] = useState<"MNQ" | "MGC">("MNQ");
  const [contracts, setContracts] = useState<string>("1");

  const resetForm = (): void => {
    setRangeHigh("");
    setRangeLow("");
    setInstrument("MNQ");
    setContracts("1");
  };

  const high = parseFloat(rangeHigh);
  const low = parseFloat(rangeLow);
  const contractCount = parseInt(contracts || "1", 10);

  const valid =
    !isNaN(high) &&
    !isNaN(low) &&
    high > low &&
    !isNaN(contractCount) &&
    contractCount > 0;

  const values = useMemo(() => {
    if (!valid) return null;

    const tickSize = instrument === "MNQ" ? 0.25 : 0.1;
    const multiplier = instrument === "MNQ" ? 2 : 10;

    const roundToTick = (num: number): number =>
      Math.round(num / tickSize) * tickSize;

    const rangeSize = roundToTick(high - low);

    const longEntry = roundToTick(high - rangeSize * 0.1);
    const longStop = roundToTick(low - rangeSize * 0.25);
    const longTarget = roundToTick(longEntry + rangeSize);

    const shortEntry = roundToTick(low + rangeSize * 0.1);
    const shortStop = roundToTick(high + rangeSize * 0.25);
    const shortTarget = roundToTick(shortEntry - rangeSize);

    const riskPerContract =
      Math.abs(longEntry - longStop) * multiplier;

    const totalRisk = riskPerContract * contractCount;

    return {
      tickSize,
      rangeSize,
      longEntry,
      longStop,
      longTarget,
      shortEntry,
      shortStop,
      shortTarget,
      riskPerContract,
      totalRisk,
    };
  }, [high, low, instrument, contractCount, valid]);

  const fmt = (num: number): string =>
    num.toFixed(instrument === "MNQ" ? 2 : 1);

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Levels Calculator</h1>
          <button
            onClick={resetForm}
            className="px-3 py-2 rounded-xl bg-zinc-800 active:bg-zinc-700 text-sm"
          >
            Reset
          </button>
        </div>

        <div>
          <label className="block text-sm mb-1 text-zinc-400">
            Range High
          </label>
          <input
            type="number"
            value={rangeHigh}
            onChange={(e) => setRangeHigh(e.target.value)}
            className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-lg"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-zinc-400">
            Range Low
          </label>
          <input
            type="number"
            value={rangeLow}
            onChange={(e) => setRangeLow(e.target.value)}
            className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-lg"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-zinc-400">
            Instrument
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["MNQ", "MGC"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setInstrument(item)}
                className={`rounded-2xl p-4 font-medium border ${instrument === item
                    ? "bg-white text-black border-white"
                    : "bg-zinc-800 border-zinc-700"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-zinc-400">
            Contracts
          </label>
          <input
            type="number"
            min="1"
            value={contracts}
            onChange={(e) => setContracts(e.target.value)}
            className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-lg"
          />
        </div>

        {values && (
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-zinc-800 p-4 space-y-1">
              <h2 className="font-semibold mb-2">Long</h2>
              <p>Range Size: {fmt(values.rangeSize)}</p>
              <p>Entry: {fmt(values.longEntry)}</p>
              <p>Stop: {fmt(values.longStop)}</p>
              <p>Target: {fmt(values.longTarget)}</p>
            </div>

            <div className="rounded-2xl bg-zinc-800 p-4 space-y-1">
              <h2 className="font-semibold mb-2">Short</h2>
              <p>Entry: {fmt(values.shortEntry)}</p>
              <p>Stop: {fmt(values.shortStop)}</p>
              <p>Target: {fmt(values.shortTarget)}</p>
            </div>

            <div className="rounded-2xl bg-zinc-800 p-4">
              <h2 className="font-semibold mb-1">Risk</h2>
              <p>${fmt(values.riskPerContract)} per contract</p>
              <p>${fmt(values.totalRisk)} total risk</p>
              <p className="text-xs text-zinc-400 mt-1">
                Rounded to {values.tickSize} tick size
              </p>
            </div>
          </div>
        )}

        {!valid && (rangeHigh || rangeLow) && (
          <p className="text-sm text-red-400">
            Enter a valid range and contract amount.
          </p>
        )}
      </div>
    </div>
  );
}