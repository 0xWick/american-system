import { Badge, type BadgeProps } from '@chakra-ui/react';

export const TIERS = [
  { name: 'Nawab Sahib', emoji: '👑', scheme: 'yellow', rule: '100', blurb: 'Pays every time, on time.' },
  { name: 'Malik Riaz Jr', emoji: '💼', scheme: 'green', rule: '80+', blurb: 'Almost always on time.' },
  { name: 'Kar len ge bro', emoji: '🤝', scheme: 'blue', rule: '50+', blurb: 'Gets there, eventually.' },
  { name: 'Mufta', emoji: '🍽️', scheme: 'orange', rule: '30+', blurb: 'Enjoys the treat, forgets the bill.' },
  { name: 'Karzai', emoji: '🧾', scheme: 'red', rule: 'under 30', blurb: 'Owes half the city.' },
  { name: 'Naya Murga', emoji: '🐣', scheme: 'gray', rule: 'new', blurb: 'New here. No record yet.' },
] as const;

export const tierStyle = (tier: string) => TIERS.find((t) => t.name === tier) ?? TIERS[TIERS.length - 1];

export default function TierBadge({ tier, ...props }: { tier: string } & BadgeProps) {
  const t = tierStyle(tier);
  return (
    <Badge colorScheme={t.scheme} variant="subtle" borderRadius="full" px={2.5} py={0.5} textTransform="none" fontWeight="semibold" {...props}>
      {t.emoji} {t.name}
    </Badge>
  );
}
