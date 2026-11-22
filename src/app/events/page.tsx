
'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useEventsQuery } from '@/hooks/use-events';
import type {
  EventStatus,
  FindAllEventsQuery,
} from '@/types/event';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const STATUS_OPTIONS = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStatusStyle(status: EventStatus) {
  switch (status) {
    case 'PLANNED':
      return 'bg-blue-100 text-blue-700';
    case 'ONGOING':
      return 'bg-green-100 text-green-700';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-700';
  }
}

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const query: FindAllEventsQuery = {
    page: 1,
    limit: 50,
    sortBy: 'startDate',
    sortOrder: 'DESC',
    search,
    ...(status !== 'ALL'
      ? { status: status as EventStatus }
      : {}),
  };

  const { data, isLoading, isError, error } =
    useEventsQuery(query);

  const events = data?.data ?? [];

  const totalEvents = data?.meta.totalItems ?? 0;

  const planned = events.filter(
    (event) => event.status === 'PLANNED',
  ).length;

  const ongoing = events.filter(
    (event) => event.status === 'ONGOING',
  ).length;

  const completed = events.filter(
    (event) => event.status === 'COMPLETED',
  ).length;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Event Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola event dan peserta dalam satu tempat.
          </p>
        </div>

        <Link
  href="/events/create"
  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
>
  Tambah Event
</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Total Event
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              {totalEvents}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Planned
            </p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {planned}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Ongoing
            </p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {ongoing}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Completed
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              {completed}
            </h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Cari nama atau lokasi event..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="flex-1"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Memuat data event...
            </p>
          )}

          {isError && (
            <p className="py-10 text-center text-red-500">
              {error.message}
            </p>
          )}

          {!isLoading && !isError && events.length === 0 && (
            <div className="py-12 text-center">
              <h3 className="font-semibold">
                Belum ada event
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tambahkan event pertama untuk mulai mengelola kegiatan.
              </p>
            </div>
          )}

          {!isLoading && !isError && events.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">
                        {event.name}
                      </h3>

                      <Badge
                        className={getStatusStyle(event.status)}
                      >
                        {event.status}
                      </Badge>
                    </div>

                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {event.description || 'Tidak ada deskripsi'}
                    </p>

                    <div className="space-y-2 text-sm">
                      <p>📍 {event.location}</p>
                      <p>
                        🗓️ {formatDate(event.startDate)}
                      </p>
                      <p>
                        🏁 {formatDate(event.endDate)}
                      </p>
                    </div>

                    <Link
  href={`/events/${event.id}`}
  className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
>
  Lihat Detail
</Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
