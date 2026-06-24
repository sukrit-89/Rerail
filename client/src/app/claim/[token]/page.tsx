import ClaimPage from "@/components/ClaimPage";

// This would be populated from on-chain / Supabase data
// For now, preview mode with placeholder values
export default async function ClaimTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // In production, look up token in Supabase to get:
  // - campaign name
  // - amount
  // - balance ID
  // For now, placeholder values for preview
  const campaignName = "Hackathon Prizes";
  const amount = "100";
  const balanceId = "00000000-0000-0000-0000-000000000000";

  return (
    <ClaimPage
      campaignName={campaignName}
      amount={amount}
      balanceId={balanceId}
      token={token}
    />
  );
}
