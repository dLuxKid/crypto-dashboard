"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, RefreshCw, Search } from "lucide-react";

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  last_updated: string;
}

export function CryptoDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCoins, setFilteredCoins] = useState<Cryptocurrency[]>([]);

  const fetchCryptoData = async (): Promise<Cryptocurrency[]> => {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch cryptocurrency data");
    }
    return response.json();
  };

  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["cryptoData"],
    queryFn: fetchCryptoData,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  useEffect(() => {
    if (data) {
      if (searchTerm) {
        const filtered = data.filter(
          (coin) =>
            coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCoins(filtered.slice(0, 5));
      } else {
        setFilteredCoins(data.slice(0, 5));
      }
    }
  }, [data, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    refetch();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else {
      return formatCurrency(value);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            className="pl-8 pr-4 h-14 rounded-md bg-white border border-gray-300"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-2">
          {dataUpdatedAt ? (
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
            </p>
          ) : null}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg flex items-center justify-center bg-neutral-900 text-white cursor-pointer hover:bg-neutral-900/90 active:bg-neutral-900/90 transition"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-dashed border-red-400 p-8 text-center">
          <p className="text-red-600">Error: {(error as Error).message}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-gray-300 shadow-sm animate-pulse"
                >
                  <div className="p-6 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        <div className="h-3 w-16 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-8 w-32 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </div>
                  <div className="border-t border-gray-300 p-6">
                    <div className="flex w-full justify-between">
                      <div className="h-3 w-24 bg-gray-300 rounded"></div>
                      <div className="h-3 w-20 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
          : filteredCoins.map((coin) => (
              <div
                key={coin.id}
                className="overflow-hidden rounded-lg border border-gray-300 shadow-sm"
              >
                <div className="p-6 pb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={coin.image || ""}
                      alt={coin.name}
                      className="size-10 rounded-full"
                    />
                    <div>
                      <h3 className="text-base font-semibold">{coin.name}</h3>
                      <p className="text-sm uppercase text-gray-500">
                        {coin.symbol}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-2 text-2xl font-bold">
                    {formatCurrency(coin.current_price)}
                  </div>
                  <div
                    className={`flex items-center text-sm ${
                      coin.price_change_percentage_24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {coin.price_change_percentage_24h >= 0 ? (
                      <ArrowUp className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
                <div className="border-t border-gray-300 p-6 text-xs text-gray-500">
                  <div className="flex w-full justify-between">
                    <span>Market Cap: {formatMarketCap(coin.market_cap)}</span>
                    <span>Updated: {formatDate(coin.last_updated)}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {data && filteredCoins.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No cryptocurrencies found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
