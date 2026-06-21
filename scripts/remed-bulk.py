#!/usr/bin/env python3
"""Bulk remediation: THEME-003 hex→tokens, RTL-002/003 physical→logical,
MOBILE-002 100vh→100dvh, FONT-002 tiny text, Z-004 z-index.
Usage: python3 remed-bulk.py <file.tsx>"""
import re, sys, os

PATHS = sys.argv[1:]
if not PATHS:
    PATHS = [
        'src/components/qtbm/StakingView.tsx',
        'src/components/qtbm/SavingsGoalsView.tsx',
        'src/components/qtbm/LaunchpadView.tsx',
        'src/components/qtbm/DeFiDashboardView.tsx',
        'src/components/qtbm/GiftCardsView.tsx',
        'src/components/qtbm/NFTGalleryView.tsx',
        'src/components/qtbm/P2PView.tsx',
        'src/components/qtbm/CopyTradingView.tsx',
        'src/components/qtbm/LeaderboardView.tsx',
        'src/components/qtbm/SocialFeedView.tsx',
        'src/components/qtbm/NewsFeedView.tsx',
        'src/components/qtbm/VotingView.tsx',
        'src/components/qtbm/TradeChallengeView.tsx',
        'src/components/qtbm/ReferralView.tsx',
        'src/components/qtbm/PriceAlertsView.tsx',
    ]
    os.chdir('/home/z/my-project')

# Order matters: most specific first
# (pattern, replacement) — applied with str.replace for literal replacements
LITERAL_REPLACEMENTS = [
    # Theme alpha variants (most specific first)
    ('bg-[#2B3139]/60', 'bg-secondary/60'),
    ('bg-[#2B3139]/40', 'bg-secondary/40'),
    ('bg-[#2B3139]/80', 'bg-secondary/80'),
    ('bg-[#1E2329]/80', 'bg-card/80'),
    ('bg-[#1E2329]/90', 'bg-card/90'),
    ('bg-[#F0B90B]/5', 'bg-primary/10'),
    ('bg-[#F0B90B]/10', 'bg-primary/10'),
    ('bg-[#F0B90B]/15', 'bg-primary/15'),
    ('bg-[#F0B90B]/20', 'bg-primary/20'),
    ('bg-[#F6465D]/5', 'bg-destructive/10'),
    ('bg-[#F6465D]/10', 'bg-destructive/10'),
    ('bg-[#F6465D]/15', 'bg-destructive/15'),
    ('bg-[#F6465D]/20', 'bg-destructive/20'),
    ('from-[#F0B90B]/10', 'from-primary/10'),
    ('from-[#F0B90B]/20', 'from-primary/20'),
    ('to-[#F0B90B]/10', 'to-primary/10'),
    ('to-[#F0B90B]/20', 'to-primary/20'),
    ('via-[#F0B90B]/20', 'via-primary/20'),
    ('border-[#F0B90B]/15', 'border-primary/15'),
    ('border-[#F0B90B]/20', 'border-primary/20'),
    ('border-[#F0B90B]/30', 'border-primary/30'),
    ('border-[#F0B90B]/40', 'border-primary/40'),
    ('hover:border-[#F0B90B]/15', 'hover:border-primary/15'),
    ('hover:border-[#F0B90B]/20', 'hover:border-primary/20'),
    ('shadow-[#F0B90B]/20', 'shadow-primary/20'),
    ('shadow-[#F0B90B]/30', 'shadow-primary/30'),
    ('shadow-[#F0B90B]/50', 'shadow-primary/50'),
    ('border-[#F6465D]/10', 'border-destructive/10'),
    ('border-[#F6465D]/20', 'border-destructive/20'),
    ('border-[#F6465D]/30', 'border-destructive/30'),
    ('border-[#F6465D]/40', 'border-destructive/40'),
    ('border-[#F6465D]/50', 'border-destructive/50'),
    ('hover:border-[#F6465D]/30', 'hover:border-destructive/30'),
    ('hover:border-[#F6465D]/50', 'hover:border-destructive/50'),
    ('bg-[#5E6673]/10', 'bg-muted-foreground/10'),
    ('bg-[#5E6673]/20', 'bg-muted-foreground/20'),
    ('text-[#F0B90B]', 'text-primary'),
    ('bg-[#F0B90B]', 'bg-primary'),
    ('from-[#F0B90B]', 'from-primary'),
    ('via-[#F0B90B]', 'via-primary'),
    ('to-[#F0B90B]', 'to-primary'),
    ('from-[#1E2329]', 'from-card'),
    ('via-[#1E2329]', 'via-card'),
    ('to-[#1E2329]', 'to-card'),
    ('from-[#2B3139]', 'from-secondary'),
    ('via-[#2B3139]', 'via-secondary'),
    ('to-[#2B3139]', 'to-secondary'),
    ('from-[#F6465D]', 'from-destructive'),
    ('via-[#F6465D]', 'via-destructive'),
    ('to-[#F6465D]', 'to-destructive'),
    ('border-[#F0B90B]', 'border-primary'),
    ('ring-[#F0B90B]', 'ring-primary'),
    ('ring-offset-[#1E2329]', 'ring-offset-card'),
    ('shadow-[#F0B90B]/25', 'shadow-primary/25'),
    ('text-[#2B3139]', 'text-secondary'),
    ('text-[#1E2329]', 'text-card'),
    ('text-[#0B0E11]', 'text-background'),
    ('bg-[#5E6673]', 'bg-muted-foreground'),
    ('bg-[#848E9C]', 'bg-muted-foreground'),
    ('bg-[#848E9C]/10', 'bg-muted-foreground/10'),
    ('border-s-[#F6465D]', 'border-s-destructive'),
    ('border-s-[#848E9C]', 'border-s-muted-foreground'),
    ('border-e-[#F6465D]', 'border-e-destructive'),
    ('border-e-[#848E9C]', 'border-e-muted-foreground'),
    ('border-[#848E9C]/20', 'border-muted-foreground/20'),
    ('border-[#F6465D]/15', 'border-destructive/15'),
    ('focus:border-[#F6465D]', 'focus:border-destructive'),
    ('focus:border-[#0ECB81]', 'focus:border-[#0ECB81]'),
    ('fill-[#F0B90B]', 'fill-primary'),
    ('fill-[#F6465D]', 'fill-destructive'),
    ('accent-[#F0B90B]', 'accent-primary'),
    ('shadow-[#F0B90B]/15', 'shadow-primary/15'),
    ('hover:bg-[#F0B90B]/90', 'hover:bg-primary/90'),
    ('hover:bg-[#F0B90B]/80', 'hover:bg-primary/80'),
    ('hover:bg-[#F0B90B]/10', 'hover:bg-primary/10'),
    ('focus:border-[#F0B90B]', 'focus:border-primary'),
    ('focus:ring-[#F0B90B]/20', 'focus:ring-primary/20'),
    ('focus:ring-[#F0B90B]/30', 'focus:ring-primary/30'),
    # Solid backgrounds/borders (most common)
    ('bg-[#0B0E11]', 'bg-background'),
    ('bg-[#1E2329]', 'bg-card'),
    ('bg-[#2B3139]', 'bg-secondary'),
    ('border-[#2B3139]', 'border-border'),
    ('border-[#1E2329]', 'border-border'),
    ('text-[#0B0E11]', 'text-background'),
    ('text-[#EAECEF]', 'text-foreground'),
    ('text-[#848E9C]', 'text-muted-foreground'),
    ('text-[#5E6673]', 'text-muted-foreground'),
    ('text-[#F6465D]', 'text-destructive'),
    ('bg-[#F6465D]', 'bg-destructive'),
    ('hover:bg-[#2B3139]', 'hover:bg-secondary'),
    ('hover:bg-[#1E2329]', 'hover:bg-card'),
    # RTL: physical → logical (most specific combos first)
    ('top-2 right-2', 'top-2 end-2'),
    ('top-3 left-3', 'top-3 start-3'),
    ('top-3 right-3', 'top-3 end-3'),
    ('top-4 right-4', 'top-4 end-4'),
    ('top-4 left-4', 'top-4 start-4'),
    ('-right-1.5', '-end-1.5'),
    ('-left-1.5', '-start-1.5'),
    ('right-0', 'end-0'),
    ('left-0', 'start-0'),
    ('right-1', 'end-1'),
    ('left-1', 'start-1'),
    ('right-2', 'end-2'),
    ('left-2', 'start-2'),
    ('right-3', 'end-3'),
    ('left-3', 'start-3'),
    ('right-4', 'end-4'),
    ('left-4', 'start-4'),
    ('right-6', 'end-6'),
    ('left-6', 'start-6'),
    ('left-1/2', 'start-1/2'),
    # RTL: padding/margin logical
    ('rounded-l-xl', 'rounded-s-xl'),
    ('rounded-l-lg', 'rounded-s-lg'),
    ('rounded-l-md', 'rounded-s-md'),
    ('rounded-r-xl', 'rounded-e-xl'),
    ('rounded-r-lg', 'rounded-e-lg'),
    ('rounded-r-md', 'rounded-e-md'),
    ('border-l-[3px]', 'border-s-[3px]'),
    ('border-r-[3px]', 'border-e-[3px]'),
    # z-index
    ('z-[100]', 'z-50'),
    ('z-[60]', 'z-50'),
    # Mobile 100vh
    ('100vh', '100dvh'),
    # Tiny text
    ('text-[8px]', 'text-[10px]'),
    ('text-[9px]', 'text-[10px]'),
]

# Regex replacements for things that need pattern matching
REGEX_REPLACEMENTS = [
    # pl-N → ps-N, pr-N → pe-N, ml-N → ms-N, mr-N → me-N (but NOT px/py/pt/pb/mt/mb)
    (re.compile(r'(?<![a-z])pl-(\d+(?:\.\d+)?)'), r'ps-\1'),
    (re.compile(r'(?<![a-z])pr-(\d+(?:\.\d+)?)'), r'pe-\1'),
    (re.compile(r'(?<![a-z])ml-(\d+(?:\.\d+)?)'), r'ms-\1'),
    (re.compile(r'(?<![a-z])mr-(\d+(?:\.\d+)?)'), r'me-\1'),
    (re.compile(r'\bml-auto\b'), 'ms-auto'),
    # border-l (no value) → border-s, border-r → border-e
    (re.compile(r'(?<![a-z])border-l(?!\w)'), 'border-s'),
    (re.compile(r'(?<![a-z])border-r(?!\w)'), 'border-e'),
    # text-left → text-start, text-right → text-end
    (re.compile(r'(?<![a-z])text-left(?!\w)'), 'text-start'),
    (re.compile(r'(?<![a-z])text-right(?!\w)'), 'text-end'),
    # rounded-l → rounded-s, rounded-r → rounded-e (no suffix)
    (re.compile(r'(?<![a-z])rounded-l(?!\w)'), 'rounded-s'),
    (re.compile(r'(?<![a-z])rounded-r(?!\w)'), 'rounded-e'),
]

for path in PATHS:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for old, new in LITERAL_REPLACEMENTS:
        content = content.replace(old, new)
    for pattern, repl in REGEX_REPLACEMENTS:
        content = pattern.sub(repl, content)
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  ✓ {path}')
    else:
        print(f'  - {path} (no changes)')
