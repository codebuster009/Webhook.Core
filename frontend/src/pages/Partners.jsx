import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import PartnerCard from '../components/partners/PartnerCard.jsx';
import RegisterPartnerModal from '../components/partners/RegisterPartnerModal.jsx';
import EditPartnerModal from '../components/partners/EditPartnerModal.jsx';
import { usePartners } from '../hooks/usePartners.js';
import { useStatsOverview } from '../hooks/useStats.js';
import { sendTestEvent } from '../services/partners.api.js';

export default function Partners() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { data: partners = [], isLoading } = usePartners();
  const { data: stats } = useStatsOverview();
  const [registerOpen, setRegisterOpen] = useState(
    () => searchParams.get('register') === '1'
  );
  const [editPartner, setEditPartner] = useState(null);

  const kpis = useMemo(() => {
    const total = partners.length;
    const active = partners.filter((p) => p.status === 'active').length;
    const rows = stats?.endpoint_summary || [];
    const avg =
      rows.length === 0
        ? 0
        : rows.reduce((sum, r) => sum + (r.uptime_pct || 0), 0) / rows.length;
    return { total, active, avgSuccess: avg };
  }, [partners, stats]);

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        data-tour="partners-header"
      >
        <div>
          <h1 className="text-2xl font-semibold">Partners</h1>
          <p className="text-sm text-muted">Registered webhook endpoints</p>
        </div>
        <Button type="button" onClick={() => setRegisterOpen(true)}>
          + Register Partner
        </Button>
      </div>

      <div className="grid gap-gutter md:grid-cols-3" data-tour="partners-kpis">
        <Kpi title="Total Partners" value={kpis.total} />
        <Kpi title="Active Endpoints" value={kpis.active} />
        <Kpi title="Avg Success Rate" value={`${kpis.avgSuccess.toFixed(1)}%`} accent />
      </div>

      <div data-tour="partners-body">
      {partners.length === 0 ? (
        <EmptyState title="No partners yet" description="Register an endpoint to begin." />
      ) : (
        <div className="grid gap-gutter md:grid-cols-2 xl:grid-cols-3">
          {partners.map((p) => (
            <PartnerCard
              key={p.id}
              partner={p}
              onEdit={() => setEditPartner(p)}
              onTest={async () => {
                await sendTestEvent(p.id);
                await qc.invalidateQueries({ queryKey: ['events'] });
              }}
              onViewEvents={() => navigate(`/events?partner_id=${encodeURIComponent(p.id)}`)}
            />
          ))}
        </div>
      )}
      </div>

      <div
        className="rounded-lg border border-gray-900 bg-[#0B0B0F] p-4 text-emerald-100"
        data-tour="partners-config"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-mono text-xs text-white/70">partner_config.json</span>
          <Button
            variant="onDark"
            className="!px-3 !py-1 text-xs uppercase tracking-wide"
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(
                JSON.stringify(
                  {
                    partner: partners[0]
                      ? {
                          id: partners[0].id,
                          endpoint: partners[0].webhookUrl,
                          retry_policy: { max_attempts: 5, backoff: 'fixed+jitter' },
                          signing_secret: 'whsec_************',
                        }
                      : {},
                  },
                  null,
                  2
                )
              )
            }
          >
            COPY_CONFIG
          </Button>
        </div>
        <pre className="mt-3 max-h-64 overflow-auto font-mono text-[11px] leading-relaxed">
          {JSON.stringify(
            {
              partner: partners[0]
                ? {
                    id: partners[0].id,
                    endpoint: partners[0].webhookUrl,
                    retry_policy: { max_attempts: 5, backoff: 'exponential' },
                    signing_secret: 'whsec_************',
                  }
                : null,
            },
            null,
            2
          )}
        </pre>
      </div>

      <RegisterPartnerModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onCreated={() => qc.invalidateQueries({ queryKey: ['partners'] })}
      />
      <EditPartnerModal
        open={Boolean(editPartner)}
        partner={editPartner}
        onClose={() => setEditPartner(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['partners'] })}
      />
    </div>
  );
}

function Kpi({ title, value, accent }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="text-[11px] font-mono uppercase tracking-wide text-muted">{title}</div>
      <div className={`mt-2 text-3xl font-semibold ${accent ? 'text-accent' : ''}`}>{value}</div>
    </div>
  );
}
