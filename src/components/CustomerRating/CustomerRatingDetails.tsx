import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, Grid, Rating as MuiRating, Card, CardContent, Avatar, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';
import apiService from '@/service/apiService';
import { getRatingColor, getRatingLabel } from '@/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import Report from './Report';
// import PaymentPerformance from './PaymentPerformance';
import { getDuration } from '@/utils/dateUtils';
import { ICustomer } from '@/types';
import { Behavior, Communication ,Payment ,BusinessStability ,ReportScore} from '@/components/common/icons/RatingIcons';

interface ICustomerRatingDoc extends ICustomer {
  rating: {
    communication: number;
    Behavior: number;
    paymentScore: number;
    businessStabilityScore: number;
    reportScore: number;
  };
  totalInvoices: number;
  totalAmountWithTax: number;
  recievedAmount: number;
  totalTaxAmount: number;
  dueAmount: number;
  overdueAmount: number;
  isFullyPaidOnTimeCount: number;
  hasLatePaymentCount: number;
  isOverdueCount: number;
  deleyedRecievedPaymentAmount: number;
  ratingScore: number;
  connectedDate: Date;
  totalLoads: number;
  reports?: Array<{ text: string; createdBy: string; createdAt: string }>;
}

const CustomerRatingDetails: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const queryClient = useQueryClient();
  const { data: doc, isLoading } = useQuery<ICustomerRatingDoc | null>({
    queryKey: ['customerRatingDetails', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const res = await apiService.getCustomerRatingDetails(customerId)
      return res?.success ? (res.data as ICustomerRatingDoc) : null;
    },
    enabled: !!customerId,
    staleTime: 1000 * 60 * 2,
  });
  const [draftRating, setDraftRating] = useState<{ communication: number; Behavior: number; paymentScore: number; businessStabilityScore: number,reportScore: number } | null>(null);


  const updateRatingMutation = useMutation({
    mutationFn: async (next: { communication: number; Behavior: number }) => {
      if (!customerId) return null;
      return apiService.addCustomerRating(customerId, { rating: next });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerRatingDetails', customerId] });
    },
  });

  // initialize local draft when doc changes
  React.useEffect(() => {
    if (doc?.rating) {
      setDraftRating({
        communication: doc?.rating?.communication || 0,
        Behavior: doc?.rating?.Behavior || 0,
        paymentScore: doc?.rating?.paymentScore || 0,
        businessStabilityScore: doc?.rating?.businessStabilityScore || 0,
        reportScore: doc?.rating?.reportScore || 0,
      });
    }
  }, [doc?.rating?.communication, doc?.rating?.Behavior, doc?.rating?.paymentScore, doc?.rating?.businessStabilityScore, doc?.rating?.reportScore]);

  const rating = doc?.rating || { communication: 0, Behavior: 0, paymentScore: 0, businessStabilityScore: 0 };
  const overallScore = Number(doc?.ratingScore ?? 0);
  const overallColor = getRatingColor(overallScore);
  const overallLabel = getRatingLabel(overallScore);

  const ratingCategories = useMemo(() => ([
    { key: 'communication', col: 4, label: 'Communication', icon: <Communication />, value: draftRating?.communication ?? rating.communication },
    { key: 'Behavior', col: 4, label: 'Behavior', icon: <Behavior />, value: draftRating?.Behavior ?? rating.Behavior },
    { key: 'Payment', col: 4, label: 'Payment Score', icon: <Payment />, value: draftRating?.paymentScore ?? doc?.rating?.paymentScore },
    { key: 'BusinessStability', col: 4, label: 'Business Stability', icon: <BusinessStability />, value: draftRating?.businessStabilityScore ?? doc?.rating?.businessStabilityScore },
    { key: 'reportScore', col: 4, label: 'Report Score', icon: <ReportScore />, value: draftRating?.reportScore ?? doc?.rating?.reportScore },
  ]), [draftRating, rating.communication, rating.Behavior, doc?.rating?.paymentScore, doc?.rating?.businessStabilityScore, doc?.rating?.reportScore]);

  const percentage = (v: number) => Math.round((v / 5) * 100);



  if (isLoading) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh' }} />
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Info Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative accent */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: `linear-gradient(to right, ${overallColor}, #d1d5db)` }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: overallColor, mr: 2 }}>{doc?.company?.charAt(0) || 'C'}</Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{doc?.company || 'Customer'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip label={(doc as any)?.status === 'active' ? 'Active' : 'Inactive'} color={(doc as any)?.status === 'active' ? 'success' : 'default'} size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">ID: {doc?.id}</Typography>
                </Box>
              </Box>
            </Box>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {!doc?.isAccountCustomer && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">MC Number</Typography>
                  <Typography variant="body1" fontWeight={500}>{doc?.mcNumber || 'N/A'}</Typography>
                </Grid>
              )}
              {!doc?.isAccountCustomer && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">USDOT</Typography>
                  <Typography variant="body1" fontWeight={500}>{doc?.usdot || 'N/A'}</Typography>
                </Grid>
              )}
              {doc?.phone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" fontWeight={500}>{doc?.phone || 'N/A'}</Typography>
                </Grid>
              )}
              {doc?.email && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight={500}>{doc?.email || 'N/A'}</Typography>
                </Grid>
              )}
              {!doc?.isAccountCustomer && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Loads</Typography>
                  <Typography variant="body1" fontWeight={500}>{doc?.totalLoads || 0}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', bgcolor: overallColor }} />
              <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="subtitle1" color="text.secondary">Overall Rating</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <MuiRating value={overallScore} precision={0.1} readOnly size="large" sx={{ '& .MuiRating-iconFilled': { color: overallColor } }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: overallColor, mb: 1 }}>
                  {overallScore.toFixed(1)}
                </Typography>
                <Chip label={overallLabel} sx={{ bgcolor: overallColor, color: 'white', fontWeight: 'bold', px: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      {/* Rating Details */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', mb: 3 }}>
        <Grid container spacing={3}>
          {ratingCategories.map((cat) => (
            <Grid item xs={12} sm={cat.col} key={cat.key}>
              <Card elevation={2} sx={{ p: 2, borderRadius: 2, border: '1px solid #f0f0f0', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: getRatingColor(cat.value || 0), mr: 2, width: 40, height: 40 }}>
                    {cat.icon}
                  </Avatar>
                  <Typography variant="subtitle1">{cat.label}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MuiRating
                    value={cat.value || 0}
                    precision={0.1}
                    disabled={cat.key === 'Payment' || cat.key === 'BusinessStability' || cat.key === 'reportScore'}
                    onChange={async (_e, newValue) => {
                      if (!customerId || cat.key === 'Payment' || cat.key === 'BusinessStability' || cat.key === 'reportScore') return;
                      const next = {
                        communication: draftRating?.communication ?? rating.communication,
                        Behavior: draftRating?.Behavior ?? rating.Behavior,
                        [cat.key]: newValue || 0,
                      } as any;
                      setDraftRating(next);
                      await updateRatingMutation.mutateAsync(next);
                    }}
                    sx={{ '& .MuiRating-iconFilled': { color: getRatingColor(cat.value || 0) } }}
                  />
                  <Typography variant="body2" sx={{ ml: 1, color: getRatingColor(cat.value || 0), fontWeight: 600 }}>
                    {(cat.value || 0).toFixed(1)}
                  </Typography>
                  <Chip size="small" sx={{ ml: 1 }} label={`${percentage(cat.value || 0)}%`} />
                  {cat.key === 'BusinessStability' ? (
                    <Typography variant="body2" sx={{ ml: 1 }}>{doc?.connectedDate ? ` this business is ${getDuration(doc.connectedDate)} old` : '—'}</Typography>
                  ) : null}
                </Box>
                {/* Progress bar */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Performance</Typography>
                    <Typography variant="caption" fontWeight="bold" color={getRatingColor(cat.value || 0)}>
                      {percentage(cat.value || 0)}%
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative', height: 8, bgcolor: 'action.disabledBackground', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percentage(cat.value || 0)}%`, bgcolor: getRatingColor(cat.value || 0), borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
          {/* <Grid item xs={12} md={8}>
            <PaymentPerformance
              totalInvoices={doc?.totalInvoices ?? 0}
              isFullyPaidOnTimeCount={doc?.isFullyPaidOnTimeCount ?? 0}
              hasLatePaymentCount={doc?.hasLatePaymentCount ?? 0}
              isOverdueCount={doc?.isOverdueCount ?? 0}
              recievedAmount={doc?.recievedAmount ?? 0}
              dueAmount={doc?.dueAmount ?? 0}
              totalAmountWithTax={doc?.totalAmountWithTax ?? 0}
              deleyedRecievedPaymentAmount={doc?.deleyedRecievedPaymentAmount ?? 0}
            />
          </Grid> */}
        </Grid>
      </Paper>

      {/* <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PaymentPerformance
            totalInvoices={doc?.totalInvoices ?? 0}
            isFullyPaidOnTimeCount={doc?.isFullyPaidOnTimeCount ?? 0}
            hasLatePaymentCount={doc?.hasLatePaymentCount ?? 0}
            isOverdueCount={doc?.isOverdueCount ?? 0}
            recievedAmount={doc?.recievedAmount ?? 0}
            dueAmount={doc?.dueAmount ?? 0}
            totalAmountWithTax={doc?.totalAmountWithTax ?? 0}
            deleyedRecievedPaymentAmount={doc?.deleyedRecievedPaymentAmount ?? 0}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Report reportScore={doc?.rating?.reportScore ?? 0}/>
        </Grid>
      </Grid> */}
    </Box>
  );
};


export default CustomerRatingDetails;
