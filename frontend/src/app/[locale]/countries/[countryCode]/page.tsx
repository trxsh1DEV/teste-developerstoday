'use client';

import { use, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BASE_URL } from '@/utils/http';

interface Border {
  commonName: string;
  officialName: string;
  countryCode: string;
  region: string;
}

interface Population {
  year: number;
  value: number;
}

interface TypeCountryDetail {
  name: string;
  countryCode: string;
  borders: Border[];
  population: Population[];
  flagUrl: string;
}

export default function CountryDetail({
  params,
}: {
  params: Promise<{ countryCode: string }>;
}) {
  const { countryCode } = use(params);
  const [country, setCountry] = useState<TypeCountryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch(`${BASE_URL}/countries/${countryCode}`);
        const data = await response.json();
        setCountry(data);
      } catch (error) {
        console.error('Error fetching country:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [countryCode]);

  // Rest of your component remains the same
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (!country)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Country not found
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <img
          src={country.flagUrl}
          alt={`Flag of ${country.name}`}
          className="w-64 h-auto shadow-lg rounded-lg"
        />
        <h1 className="text-4xl font-bold text-center md:text-left">
          {country.name}
        </h1>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Bordering Countries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {country.borders.map((border) => (
            <Link
              href={`/countries/${border.countryCode}`}
              key={border.countryCode}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-medium">{border.commonName}</h3>
                <p className="text-sm text-gray-500">{border.region}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Population Over Time</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={country.population}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tickCount={10} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${(value / 1000000).toFixed(1)}M`,
                  'Population',
                ]}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
