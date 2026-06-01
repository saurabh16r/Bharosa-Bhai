import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle, Font } from '@react-pdf/renderer';
import { DashboardMetrics } from "@/lib/scoring";
import { UserDetails, TestAnswers } from "@/store/useTestStore";

// Register fonts if needed (we will use default standard fonts for now, but style them tightly)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf', fontWeight: 700 }
  ]
});

const colors = {
  primary: '#F7B500',
  secondary: '#1E88FF',
  background: '#FFFFFF',
  text: '#111111',
  muted: '#737373',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B'
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.background,
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: 'Inter',
    color: colors.text
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    marginBottom: 20
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.primary
  },
  reportTitle: {
    fontSize: 14,
    color: colors.muted
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: colors.muted
  },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 12, color: colors.text },
  h2: { fontSize: 18, fontWeight: 600, marginBottom: 8, color: colors.text, marginTop: 16 },
  h3: { fontSize: 14, fontWeight: 600, marginBottom: 4, color: colors.text },
  body: { fontSize: 12, lineHeight: 1.5, color: colors.text, marginBottom: 8 },
  small: { fontSize: 10, color: colors.muted },
  
  card: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16
  },
  col: {
    flex: 1
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    color: '#FFF',
    alignSelf: 'flex-start'
  },
  gapBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 4,
    overflow: 'hidden'
  },
  gapBarFill: {
    height: '100%',
    borderRadius: 4
  }
});

interface Props {
  metrics: DashboardMetrics;
  user: Partial<UserDetails>;
  answers: Partial<TestAnswers>;
}

// Helper to draw a generic SVG Arc (for gauges)
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");

  return d;       
}

// Shared default profile for PDF Goal Calculations
const DEFAULT_PROFILES: Record<string, { currentCost: number, yearsRemaining: number }> = {
  "Dream House": { currentCost: 10000000, yearsRemaining: 10 },
  "Dream Car": { currentCost: 2000000, yearsRemaining: 5 },
  "Vacation": { currentCost: 500000, yearsRemaining: 2 },
  "Child Education": { currentCost: 2500000, yearsRemaining: 15 },
  "Child Marriage": { currentCost: 3000000, yearsRemaining: 20 },
  "Retirement": { currentCost: 20000000, yearsRemaining: 30 },
};

export const FinancialReportPDF = ({ metrics, user, answers }: Props) => {
  const formatCur = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const getScoreColor = (score: number) => {
    if (score >= 60) return colors.success;
    if (score >= 40) return colors.primary;
    return colors.danger;
  };

  // SWP Table Data
  const swpData = [];
  const swpRate = 10;
  const retirementInflation = 6;
  const currentAge = user.age || 30;
  const retireAt = user.retireAt || 60;
  const yearsToRetire = Math.max(0, retireAt - currentAge);
  const totalOutflow = (answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0);
  const futureAnnualExpense = (totalOutflow * Math.pow(1 + 0.06, yearsToRetire)) * 12;
  
  // Protection Tab Logic for PDF
  const deps = answers.dependents || [];
  const numChildren = answers.numberOfChildren || 0;
  const hasSpouse = deps.includes("Spouse");
  const hasParents = deps.includes("Parents");
  const currentTermCover = answers.hasTermInsurance ? 5000000 : 0;
  const currentHealthCover = answers.hasHealthInsurance ? 500000 : 0;
  const baseExpenses = (answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0);
  
  const spouseSupport = hasSpouse ? Math.round(baseExpenses * 0.5) : 0;
  const parentSupport = hasParents ? Math.round(baseExpenses * 0.25) : 0;
  const childSupport = numChildren > 0 ? Math.round((baseExpenses * 0.25) / numChildren) * numChildren : 0;

  const parentCoverRequired = parentSupport > 0 ? (parentSupport * 12) / 0.07 : 0;
  const spouseCoverRequired = spouseSupport > 0 ? (spouseSupport * 12) / 0.07 : 0;
  const childCoverRequired = childSupport > 0 ? (childSupport * 12) / 0.07 : 0;
  
  const totalTermRequired = parentCoverRequired + spouseCoverRequired + childCoverRequired;
  const termGap = Math.max(0, totalTermRequired - currentTermCover);

  let healthRequired = 1000000;
  if (hasSpouse) healthRequired = 1500000;
  if (numChildren > 0) healthRequired = 2000000;
  if (hasParents) healthRequired = 2500000;
  const healthGap = Math.max(0, healthRequired - currentHealthCover);

  const efRequired = baseExpenses * 9;
  const efGap = Math.max(0, efRequired - (answers.emergencyFund || 0));

  let currentBalance = metrics.retirementCorpusRequired;
  let currentAnnualWithdrawal = futureAnnualExpense;

  for (let age = retireAt; age <= 85; age += 5) {
    swpData.push({
      age,
      withdrawal: currentAnnualWithdrawal,
      remaining: currentBalance
    });
    for(let i=0; i<5; i++) {
       const returnAmt = currentBalance * (swpRate / 100);
       currentBalance = currentBalance + returnAmt - currentAnnualWithdrawal;
       currentAnnualWithdrawal = currentAnnualWithdrawal * (1 + (retirementInflation / 100));
    }
  }

  const Header = () => (
    <View style={styles.headerRow} fixed>
      <Text style={styles.logoText}>Bharosa Bhai</Text>
      <Text style={styles.reportTitle}>{user.name}'s Financial Plan</Text>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Generated by Bharosa Bhai on {today}</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} of ${totalPages}`
      )} />
    </View>
  );

  return (
    <Document>
      {/* PAGE 1: COVER & EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <Header />
        
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 40 }}>
          <Text style={{ fontSize: 32, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Your Personalized</Text>
          <Text style={{ fontSize: 32, fontWeight: 700, color: colors.text, marginBottom: 20 }}>Financial Plan</Text>
          <Text style={styles.h2}>Prepared for {user.name}</Text>
          <Text style={styles.body}>Age {user.age} | City: {user.city || 'India'} | Retiring at {user.retireAt}</Text>
        </View>

        <View style={{ ...styles.card, alignItems: 'center', padding: 30 }}>
          <Text style={styles.h2}>Financial Health Score</Text>
          
          <Svg width={160} height={90} viewBox="0 0 200 100" style={{ marginVertical: 20 }}>
             <Path d={describeArc(100, 90, 80, -90, 90)} stroke={colors.border} strokeWidth={15} fill="none" />
             {metrics.overallScore > 0 && (
               <Path 
                 d={describeArc(100, 90, 80, -90, -90 + (180 * (metrics.overallScore/100)))} 
                 stroke={getScoreColor(metrics.overallScore)} 
                 strokeWidth={15} 
                 fill="none" 
               />
             )}
          </Svg>
          <Text style={{ fontSize: 48, fontWeight: 700, color: getScoreColor(metrics.overallScore), marginTop: -40 }}>{metrics.overallScore}</Text>
          <Text style={styles.small}>out of 100</Text>
          
          <View style={{ ...styles.badge, backgroundColor: getScoreColor(metrics.overallScore), marginTop: 10 }}>
            <Text>{metrics.healthStatus}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h3}>Executive Summary</Text>
          <Text style={styles.body}>Based on our analysis of your cash flow, goals, and existing protection, your financial health needs attention in specific areas. The following pages break down your retirement corpus requirement, your funding gaps for individual life goals, and your family's protection needs.</Text>
        </View>

        <Footer />
      </Page>

      {/* PAGE 2: RETIREMENT ANALYSIS */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.h1}>Retirement Analysis</Text>
        
        <View style={styles.row}>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.small}>Retirement Age</Text>
              <Text style={styles.h2}>{user.retireAt}</Text>
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.small}>Years to Retire</Text>
              <Text style={styles.h2}>{Math.max(0, (user.retireAt || 60) - (user.age || 30))} Years</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h3}>Corpus & Funding</Text>
          <View style={styles.row}>
             <View style={styles.col}>
                <Text style={styles.small}>Target Corpus Required</Text>
                <Text style={{ fontSize: 20, fontWeight: 700, color: colors.secondary }}>{formatCur(metrics.retirementCorpusRequired)}</Text>
             </View>
             <View style={styles.col}>
                <Text style={styles.small}>Corpus Funding Gap</Text>
                <Text style={{ fontSize: 20, fontWeight: 700, color: colors.danger }}>{formatCur(metrics.retirementCorpusGap)}</Text>
             </View>
          </View>
          
          <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
             <Text style={styles.h3}>Required Monthly SIP</Text>
             <Text style={{ fontSize: 24, fontWeight: 700, color: colors.primary }}>{formatCur(metrics.requiredRetirementSip)}</Text>
             <Text style={styles.body}>Start this SIP today to bridge your retirement gap completely by age {user.retireAt}. Assumes 14% CAGR.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h3}>Retirement Readiness Score</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 32, fontWeight: 700, color: getScoreColor(metrics.retirementScore) }}>{metrics.retirementScore}</Text>
            <Text style={styles.small}>/ 100</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h3}>Post Retirement Plan (SWP)</Text>
          <Text style={styles.body}>Projected withdrawal schedule based on 10% expected return and 6% retirement inflation.</Text>
          <View style={{ ...styles.row, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 5, marginTop: 10 }}>
            <Text style={{ ...styles.col, fontSize: 10, fontWeight: 700 }}>Age</Text>
            <Text style={{ ...styles.col, fontSize: 10, fontWeight: 700 }}>Annual Withdrawal</Text>
            <Text style={{ ...styles.col, fontSize: 10, fontWeight: 700, textAlign: 'right' }}>Remaining Corpus</Text>
          </View>
          {swpData.map((row, i) => (
            <View key={i} style={{ ...styles.row, marginBottom: 5 }}>
               <Text style={{ ...styles.col, fontSize: 10 }}>{row.age}</Text>
               <Text style={{ ...styles.col, fontSize: 10, color: colors.primary }}>{formatCur(row.withdrawal)}</Text>
               <Text style={{ ...styles.col, fontSize: 10, textAlign: 'right', color: row.remaining > 0 ? colors.text : colors.danger }}>
                 {row.remaining > 0 ? formatCur(row.remaining) : "Depleted"}
               </Text>
            </View>
          ))}
        </View>

        <Footer />
      </Page>

      {/* PAGE 3: GOALS ANALYSIS */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.h1}>Goals Analysis</Text>
        <Text style={styles.body}>You have selected {metrics.activeGoalsCount} life goals to plan for.</Text>

        {(answers.goals || []).map((goal, i) => {
          const profile = DEFAULT_PROFILES[goal] || { currentCost: 1000000, yearsRemaining: 10 };
          const futureCost = profile.currentCost * Math.pow(1 + 0.06, profile.yearsRemaining);
          const monthlyRate = 0.12 / 12;
          const months = profile.yearsRemaining * 12;
          const requiredSip = futureCost > 0 ? (futureCost * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)) : 0;
          
          return (
            <View key={i} style={styles.card} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.h2}>{goal}</Text>
                <View style={{ ...styles.badge, backgroundColor: colors.primary }}><Text>In {profile.yearsRemaining} Years</Text></View>
              </View>
              <Text style={styles.body}>A dedicated SIP should be started and tagged specifically for this goal to ensure it is funded on time without dipping into your retirement corpus.</Text>
              
              <View style={{ ...styles.row, marginTop: 10 }}>
                 <View style={styles.col}>
                    <Text style={styles.small}>Today's Cost</Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{formatCur(profile.currentCost)}</Text>
                 </View>
                 <View style={styles.col}>
                    <Text style={styles.small}>Target Future Cost (6% Infl.)</Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: colors.danger }}>{formatCur(futureCost)}</Text>
                 </View>
                 <View style={styles.col}>
                    <Text style={styles.small}>Required New SIP</Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: colors.success }}>{formatCur(requiredSip)}</Text>
                 </View>
              </View>
            </View>
          );
        })}
        
        {metrics.activeGoalsCount === 0 && (
          <View style={styles.card}>
            <Text style={styles.body}>No specific life goals selected other than retirement.</Text>
          </View>
        )}
        <Footer />
      </Page>

      {/* PAGE 4: INSURANCE ANALYSIS */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.h1}>Insurance & Protection Analysis</Text>
        <Text style={styles.body}>Your safety net protects your family and your accumulated wealth from unexpected life events.</Text>
        
        <View style={styles.card}>
          <Text style={styles.h2}>Term Life Insurance</Text>
          <Text style={styles.body}>Calculated using the income-replacement method (0.07 Safe Withdrawal Rate) to ensure your dependents' lifestyle is protected forever.</Text>
          
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
               <Text style={styles.small}>Required Cover</Text>
               <Text style={styles.h3}>{formatCur(totalTermRequired)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
               <Text style={styles.small}>Current Gap</Text>
               <Text style={{...styles.h3, color: colors.danger}}>{formatCur(termGap)}</Text>
            </View>
          </View>

          <View style={styles.gapBarBg}>
            <View style={{ ...styles.gapBarFill, backgroundColor: colors.danger, width: `${(termGap / (totalTermRequired || 1)) * 100}%` }} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>Health Insurance</Text>
          <Text style={styles.body}>Based on your age, city, and number of dependents. Upgrade to a comprehensive family floater.</Text>
          
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
               <Text style={styles.small}>Required Cover</Text>
               <Text style={styles.h3}>{formatCur(healthRequired)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
               <Text style={styles.small}>Current Gap</Text>
               <Text style={{...styles.h3, color: colors.danger}}>{formatCur(healthGap)}</Text>
            </View>
          </View>

          <View style={styles.gapBarBg}>
            <View style={{ ...styles.gapBarFill, backgroundColor: colors.danger, width: `${(healthGap / (healthRequired || 1)) * 100}%` }} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>Emergency Fund</Text>
          <Text style={styles.body}>A 9-month safety net based on your current lifestyle expenses.</Text>
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
               <Text style={styles.small}>Target Corpus</Text>
               <Text style={styles.h3}>{formatCur(efRequired)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
               <Text style={styles.small}>Shortfall</Text>
               <Text style={{...styles.h3, color: colors.warning}}>{formatCur(efGap)}</Text>
            </View>
          </View>
        </View>

        <Footer />
      </Page>

      {/* PAGE 5: FINANCIAL SNAPSHOT */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.h1}>Financial Snapshot</Text>
        
        <View style={styles.card}>
          <Text style={styles.h3}>Monthly Cashflow</Text>
          <View style={styles.row}>
            <View style={styles.col}>
               <Text style={styles.small}>Income</Text>
               <Text style={{...styles.h2, color: colors.success}}>{formatCur(answers.monthlyIncome || 0)}</Text>
            </View>
            <View style={styles.col}>
               <Text style={styles.small}>Total Outflow</Text>
               <Text style={{...styles.h2, color: colors.danger}}>{formatCur((answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0))}</Text>
            </View>
            <View style={styles.col}>
               <Text style={styles.small}>Net Savings</Text>
               <Text style={{...styles.h2, color: metrics.monthlySavings > 0 ? colors.secondary : colors.danger}}>{formatCur(metrics.monthlySavings)}</Text>
            </View>
          </View>
          <Text style={styles.body}>Your savings rate is {metrics.savingsPercentage.toFixed(1)}%. A healthy target is at least 30%.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.h3}>Emergency Fund Readiness</Text>
          <View style={styles.row}>
             <View style={styles.col}>
                <Text style={styles.small}>Current Emergency Fund</Text>
                <Text style={styles.h2}>{formatCur(answers.emergencyFund || 0)}</Text>
             </View>
             <View style={styles.col}>
                <Text style={styles.small}>Required (6 Months)</Text>
                <Text style={styles.h2}>{formatCur(metrics.emergencyFundRequired)}</Text>
             </View>
          </View>
          {metrics.emergencyFundGap > 0 && (
             <Text style={{...styles.body, color: colors.warning, marginTop: 10}}>
               ⚠️ You have a shortfall of {formatCur(metrics.emergencyFundGap)}. This should be your first priority.
             </Text>
          )}
        </View>

        <View style={styles.card}>
           <Text style={styles.h3}>Family Profile Analyzed</Text>
           <Text style={styles.body}>Dependents: {(answers.dependents || []).join(", ") || "None"}</Text>
           <Text style={styles.body}>Children: {answers.numberOfChildren || 0}</Text>
        </View>
        <Footer />
      </Page>

      {/* PAGE 6: PRIORITY ACTION PLAN */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.h1}>Priority Action Plan</Text>
        <Text style={styles.body}>Execute these specific steps over the next 6 months to drastically improve your financial health and close your critical gaps.</Text>

        <View style={{ marginTop: 20 }}>
          
          {metrics.termInsuranceGap > 0 && (
            <View style={styles.card} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.h2}>1. Buy Term Insurance</Text>
                <View style={{ ...styles.badge, backgroundColor: colors.danger, marginTop: 16 }}><Text>High Priority</Text></View>
              </View>
              <Text style={styles.body}>Purchase a pure term insurance cover of {formatCur(metrics.termInsuranceGap)} to protect your family's future income. Do not mix insurance with investments.</Text>
            </View>
          )}

          {metrics.healthInsuranceGap > 0 && (
            <View style={styles.card} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.h2}>2. Secure Health Cover</Text>
                <View style={{ ...styles.badge, backgroundColor: colors.danger, marginTop: 16 }}><Text>High Priority</Text></View>
              </View>
              <Text style={styles.body}>Obtain a comprehensive health insurance base policy of {formatCur(metrics.healthInsuranceGap)}. Medical inflation will wipe out your savings without this.</Text>
            </View>
          )}

          {metrics.emergencyFundGap > 0 && (
            <View style={styles.card} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.h2}>3. Build Emergency Fund</Text>
                <View style={{ ...styles.badge, backgroundColor: colors.warning, marginTop: 16 }}><Text>Medium Priority</Text></View>
              </View>
              <Text style={styles.body}>Start sweeping cash into a liquid mutual fund or FD until you close the gap of {formatCur(metrics.emergencyFundGap)}.</Text>
            </View>
          )}

          {metrics.retirementCorpusGap > 0 && (
            <View style={styles.card} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.h2}>4. Start Retirement SIP</Text>
                <View style={{ ...styles.badge, backgroundColor: colors.success, marginTop: 16 }}><Text>Wealth Creation</Text></View>
              </View>
              <Text style={styles.body}>Start an SIP of {formatCur(metrics.requiredRetirementSip)} exclusively tagged for your retirement at age {user.retireAt}. Use a diversified portfolio of index funds.</Text>
            </View>
          )}

          <View style={styles.card} wrap={false}>
             <Text style={styles.h2}>5. Connect with an Advisor</Text>
             <Text style={styles.body}>Book a discovery call with a Bharosa Bhai financial expert to validate this plan, optimize your existing investments, and execute these actions.</Text>
          </View>

        </View>

        <Footer />
      </Page>

      {/* PAGE 5: LIFE JOURNEY ROADMAP */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.h1}>Life Journey Roadmap</Text>
        <Text style={styles.body}>A chronological timeline of your major financial milestones up to your retirement.</Text>
        
        <View style={{ ...styles.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
           <Text style={styles.h3}>Financial Journey Score</Text>
           <Text style={{ fontSize: 24, fontWeight: 700, color: getScoreColor(Math.round((metrics.protectionScore * 0.3) + (metrics.retirementScore * 0.4) + (metrics.goalsScore * 0.3))) }}>
             {Math.round((metrics.protectionScore * 0.3) + (metrics.retirementScore * 0.4) + (metrics.goalsScore * 0.3))} / 100
           </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>Chronological Milestones</Text>
          <View style={{ marginTop: 10 }}>
            {(() => {
              const currentAge = user.age || 30;
              const retireAt = user.retireAt || 60;
              const inflation = 6;
              const activeGoals = answers.goals || [];
              const milestones = activeGoals.filter(g => g !== "Retirement").map(name => {
                const p = DEFAULT_PROFILES[name] || { currentCost: 1000000, yearsRemaining: 10 };
                return { name, ageTrigger: currentAge + p.yearsRemaining, baseCost: p.currentCost };
              });
              
              const totalOutflow = (answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0);
              const yearsToRetire = Math.max(0, retireAt - currentAge);
              const futureAnnualExpense = (totalOutflow * Math.pow(1 + (inflation / 100), yearsToRetire)) * 12;
              const requiredCorpus = futureAnnualExpense * 30;
              
              milestones.push({
                name: "Retirement",
                ageTrigger: retireAt,
                baseCost: requiredCorpus / Math.pow(1 + (inflation / 100), yearsToRetire)
              });

              milestones.sort((a, b) => a.ageTrigger - b.ageTrigger);

              return milestones.map((m, i) => {
                const yearsRemaining = m.ageTrigger - currentAge;
                const futureCost = m.baseCost * Math.pow(1 + (inflation / 100), yearsRemaining);
                
                return (
                  <View key={i} style={{ ...styles.row, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 10 }}>
                     <View style={{ width: 60 }}>
                        <View style={{ ...styles.badge, backgroundColor: m.name === 'Retirement' ? colors.primary : colors.secondary }}>
                           <Text>Age {m.ageTrigger}</Text>
                        </View>
                     </View>
                     <View style={styles.col}>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{m.name}</Text>
                        <Text style={styles.small}>In {yearsRemaining} Years</Text>
                     </View>
                     <View style={{ width: 120, alignItems: 'flex-end' }}>
                        <Text style={styles.small}>Target Future Cost</Text>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: m.name === 'Retirement' ? colors.primary : colors.text }}>{formatCur(futureCost)}</Text>
                     </View>
                  </View>
                );
              });
            })()}
          </View>
        </View>

        <View style={styles.card}>
           <Text style={styles.h2}>Next Steps</Text>
           <Text style={styles.body}>Review this roadmap annually or whenever a major life event occurs. Ensure your current SIPs are distinctly mapped to these milestones so that funding one goal does not accidentally deplete another.</Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
};
