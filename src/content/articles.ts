/**
 * Educational articles. Content is general investor education and must not
 * promote specific schemes. Each block is rendered by pages/Article.tsx.
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'callout'; text: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Basics' | 'Strategy' | 'Risk' | 'Planning';
  readMinutes: number;
  body: Block[];
}

export const articles: Article[] = [
  {
    slug: 'what-is-a-mutual-fund',
    title: 'What is a mutual fund, and how does it work?',
    excerpt: 'A plain-language introduction to pooled investing, NAV, fund managers and how your money is held.',
    category: 'Basics',
    readMinutes: 5,
    body: [
      { type: 'p', text: 'A mutual fund pools money from many investors and invests it in a portfolio of securities such as shares, bonds or money market instruments. Each investor owns units of the fund in proportion to the amount they invest.' },
      { type: 'h2', text: 'Who manages the money?' },
      { type: 'p', text: 'Mutual funds in India are set up as trusts and managed by Asset Management Companies (AMCs) registered with SEBI. A professional fund manager makes investment decisions within the objective and limits stated in the scheme documents.' },
      { type: 'h2', text: 'Understanding NAV' },
      { type: 'p', text: 'The Net Asset Value (NAV) is the value of one unit. It is calculated at the end of each business day as the market value of the fund’s holdings, minus expenses and liabilities, divided by the number of units. When the underlying securities rise in value, the NAV rises, and vice versa.' },
      { type: 'h2', text: 'Where is my money held?' },
      { type: 'p', text: 'The fund’s assets are held by an independent custodian, separate from the AMC. Your units are recorded in your name with the Registrar and Transfer Agent (RTA). You receive a Consolidated Account Statement that shows all your mutual fund holdings across AMCs.' },
      { type: 'h2', text: 'Key benefits' },
      { type: 'ul', items: ['Diversification across many securities, even with a small investment', 'Professional management', 'Liquidity: most open-ended schemes can be redeemed on any business day', 'Regulation and transparency, with portfolios disclosed periodically'] },
      { type: 'callout', text: 'Mutual funds do not offer guaranteed returns. The value of your investment can go down as well as up.' },
    ],
  },
  {
    slug: 'types-of-mutual-funds',
    title: 'Types of mutual funds explained',
    excerpt: 'Equity, debt, hybrid, solution-oriented and index funds: what each category is designed to do.',
    category: 'Basics',
    readMinutes: 6,
    body: [
      { type: 'p', text: 'SEBI classifies mutual fund schemes into broad categories so that investors can compare like with like. Each category has defined rules about what the scheme can invest in.' },
      { type: 'h2', text: 'Equity funds' },
      { type: 'p', text: 'Invest predominantly in shares of companies. They aim for long-term growth and carry higher short-term volatility. Sub-categories include large cap, mid cap, small cap, flexi cap, sectoral/thematic and ELSS (tax-saving with a three-year lock-in).' },
      { type: 'h2', text: 'Debt funds' },
      { type: 'p', text: 'Invest in fixed-income instruments such as government securities, corporate bonds and money market instruments. They are generally less volatile than equity funds but carry interest-rate risk and credit risk. Sub-categories range from overnight and liquid funds to long-duration and credit-risk funds.' },
      { type: 'h2', text: 'Hybrid funds' },
      { type: 'p', text: 'Combine equity and debt in varying proportions. Examples include conservative hybrid, balanced advantage, aggressive hybrid and multi-asset allocation funds.' },
      { type: 'h2', text: 'Solution-oriented funds' },
      { type: 'p', text: 'Designed for specific goals such as retirement or children’s needs, usually with a lock-in period of five years or until the goal age, whichever is earlier.' },
      { type: 'h2', text: 'Other schemes' },
      { type: 'p', text: 'Index funds and Exchange Traded Funds (ETFs) track a market index passively. Fund of Funds invest in other mutual fund schemes, including international funds.' },
      { type: 'callout', text: 'The right category depends on your goal, time horizon and risk appetite, not on recent performance.' },
    ],
  },
  {
    slug: 'sip-vs-lump-sum',
    title: 'SIP vs lump sum: which approach suits you?',
    excerpt: 'How systematic and one-time investing differ, and when each tends to make sense.',
    category: 'Strategy',
    readMinutes: 5,
    body: [
      { type: 'p', text: 'There are two common ways to invest in a mutual fund: a Systematic Investment Plan (SIP), where you invest a fixed amount at regular intervals, and a lump sum, where you invest a larger amount at once.' },
      { type: 'h2', text: 'How a SIP works' },
      { type: 'p', text: 'With a SIP, the same amount buys more units when prices are low and fewer when prices are high. Over time this averages out your purchase cost, often called rupee cost averaging. It does not guarantee a profit or protect against loss in a declining market.' },
      { type: 'h2', text: 'When a lump sum may fit' },
      { type: 'p', text: 'If you already have a sum to invest, for example a bonus or maturity proceeds, a lump sum puts the entire amount to work immediately. For equity-oriented investments, some investors prefer to stagger entry using a Systematic Transfer Plan to reduce the impact of timing.' },
      { type: 'h2', text: 'A quick comparison' },
      { type: 'ul', items: ['SIP suits regular income and builds investing discipline', 'Lump sum suits investors who already have capital to deploy', 'SIP reduces the stress of timing the market', 'Lump sum has the entire amount exposed to market movement from day one'] },
      { type: 'callout', text: 'Use our SIP and lump sum calculators to explore hypothetical scenarios. Remember that actual returns are not constant and can be negative.' },
    ],
  },
  {
    slug: 'equity-vs-debt-funds',
    title: 'Equity vs debt funds: understanding the difference',
    excerpt: 'Two building blocks of most portfolios: how they behave, what risks they carry and how they work together.',
    category: 'Basics',
    readMinutes: 5,
    body: [
      { type: 'p', text: 'Equity and debt funds behave very differently, and most investors benefit from understanding both before building a portfolio.' },
      { type: 'h2', text: 'Equity funds' },
      { type: 'p', text: 'Equity funds own shares in businesses. Their value moves with company earnings and market sentiment. They can be volatile over months or a few years, but historically have been used for long-term goals where there is time to ride out fluctuations.' },
      { type: 'h2', text: 'Debt funds' },
      { type: 'p', text: 'Debt funds lend money to governments and companies in exchange for interest. They tend to be more stable, but are not risk-free: bond prices fall when interest rates rise (interest-rate risk), and borrowers can default (credit risk).' },
      { type: 'h2', text: 'Using both together' },
      { type: 'p', text: 'Asset allocation, meaning how you divide money between equity, debt and other assets, often matters more than individual scheme choice. A common approach is a higher equity share for distant goals and a higher debt share as a goal approaches.' },
      { type: 'callout', text: 'Always check the Riskometer and the scheme documents. Two funds in the same broad category can carry very different levels of risk.' },
    ],
  },
  {
    slug: 'understanding-risk',
    title: 'Understanding investment risk and the Riskometer',
    excerpt: 'Market risk, interest-rate risk, credit risk and liquidity risk, and how to read the six-level Riskometer.',
    category: 'Risk',
    readMinutes: 6,
    body: [
      { type: 'p', text: 'Every investment carries some risk. Understanding which risks apply to which funds helps you make choices you are comfortable staying with.' },
      { type: 'h2', text: 'Common types of risk' },
      { type: 'ul', items: ['Market risk: prices of securities fall due to economic or market events', 'Interest-rate risk: bond prices fall when interest rates rise', 'Credit risk: a borrower fails to pay interest or principal', 'Liquidity risk: securities cannot be sold quickly without a price impact', 'Concentration risk: too much exposure to one sector, theme or company'] },
      { type: 'h2', text: 'Reading the Riskometer' },
      { type: 'p', text: 'SEBI requires every scheme to display a Riskometer with six levels: Low, Low to Moderate, Moderate, Moderately High, High and Very High. It is reviewed monthly based on the actual portfolio. Check it before investing and periodically after.' },
      { type: 'h2', text: 'Matching risk to your goals' },
      { type: 'p', text: 'Your risk capacity depends on your time horizon, income stability and existing savings. Your risk tolerance is how comfortable you are watching values fall temporarily. A suitable investment respects both.' },
      { type: 'callout', text: 'Higher potential returns usually come with higher risk. No mutual fund is risk-free.' },
    ],
  },
  {
    slug: 'power-of-starting-early',
    title: 'Why starting early matters more than starting big',
    excerpt: 'How time and compounding interact, illustrated with simple hypothetical numbers.',
    category: 'Planning',
    readMinutes: 4,
    body: [
      { type: 'p', text: 'Compounding means returns earn further returns over time. The longer your money stays invested, the more this effect can build up.' },
      { type: 'h2', text: 'A hypothetical illustration' },
      { type: 'p', text: 'Consider two investors who each invest ₹5,000 a month with an assumed constant return of 10% a year. One starts at age 25 and invests for 30 years; the other starts at 35 and invests for 20 years. The first invests ₹18 lakh in total and the second ₹12 lakh, but because of the extra decade of compounding, the first investor’s illustrative corpus is roughly three times larger.' },
      { type: 'p', text: 'These figures are purely illustrative. Real returns fluctuate and are not guaranteed, but the principle holds: time in the market is a powerful ally.' },
      { type: 'h2', text: 'Practical takeaways' },
      { type: 'ul', items: ['Start with what you can afford, even if it is small', 'Increase your SIP as your income rises (a step-up SIP)', 'Avoid interrupting long-term investments for short-term needs: keep an emergency fund instead', 'Review periodically, but resist reacting to every market movement'] },
      { type: 'callout', text: 'Explore your own scenarios with our Step-up SIP calculator.' },
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
