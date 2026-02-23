![BidNest — Modern Chit Fund Management](images/projects/BidNest.png)

https://bid-nest-omega.vercel.app

# BidNest — My Most Significant Financial Platform

## A Professional Achievement

BidNest represents one of my most complex and rewarding projects as a developer - a comprehensive platform designed to modernize the traditional chit fund industry. By combining advanced financial algorithms with a clean, intuitive user interface, I've built a system that transforms group savings from a manual, trust-dependent process into a transparent, data-driven digital experience.

![BidNest — dashboard](images/projects/BidNest-1.png)

## The Journey

### Why BidNest Matters

Traditional chit funds are a vital part of community finance in many parts of the world, but they are often plagued by manual errors, lack of transparency, and complex dividend calculations. BidNest was born from the need to solve these challenges through technology. This project allowed me to dive deep into financial logic, ensuring that every cent is accounted for and every auction is fair.

### Technical Challenges Overcome

- **Financial Precision**: Implementing the "Roundoff & Carry Forward" logic to ensure dividends are distributed in easy-to-manage denominations while maintaining perfect balance sheets.
- **Audit Traceability**: Creating an immutable audit log system that tracks every change to critical financial records.
- **Data Integrity**: Managing complex relational data between users, members, chit groups, auctions, and payments using Prisma.
- **Calculated State**: Developing a robust calculation engine that handles various commission types (Fixed vs Percent) and carry-forward scenarios.

## What Makes This Special

### Finance Meets Transparency
Combining the age-old practice of rotating savings with modern web technologies like Next.js and PostgreSQL. BidNest isn't just a management tool; it's a trust-building platform that ensures every member has visibility into the group's health.

### Built For Precision
The calculation logic handles complex scenarios including:
- **Variable Commissions**: Flexible setup for fixed or percentage-based fees.
- **Dividend Rounding**: Intelligent rounding to 10, 50, or 100 denominations.
- **Carry-Forward Mechanisms**: Ensuring remainders from rounding are accurately carried to the next month's pool.

### Personal Growth
This project pushed my boundaries in:
- **Defensive Programming**: Validating complex financial inputs and ensuring consistent database state.
- **System Design**: Architecting a modular system where UI components reflect a complex underlying data model.
- **Schema Design**: Optimizing PostgreSQL schemas for financial consistency and performance.

## Technical Highlights

### Built With Pride
- **Next.js 14+**: Utilizing App Router for high-performance server-side rendering and API routes.
- **TypeScript**: Ensuring strict type safety across the entire financial stack.
- **Tailwind CSS**: A custom-built, professional financial UI design system.
- **Prisma ORM**: Robust database management with type-safe queries.
- **PostgreSQL**: Reliable storage for sensitive financial and member data.

### Features I'm Most Proud Of
- **Calculation Engine**: A dedicated util-based logic for auctions and dividends that handles sub-unit carry-overs.
- **Admin Dashboard**: A centralized control center for managing multiple chit groups and member registries.
- **Payment Lifecycle**: Real-time tracking of partial and completed payments with support for UPI and Bank Transfers.
- **Security First**: Multi-layered authentication and role-based access for administrator operations.

## The Impact

### For Administrators
- **Automation**: Drastically reduced time spent on manual dividend calculations and payment tracking.
- **Compliance**: Clear audit logs for all transactions, reducing disputes and errors.
- **Scale**: The ability to manage dozens of groups and hundreds of members from a single interface.

### For Me Personally
- **Portfolio Milestone**: A project that demonstrates high-level full-stack capabilities and financial domain knowledge.
- **Professionalism**: Applying rigorous engineering standards to a real-world community finance problem.

---

# BidNest Site Overview

**BidNest** is a specialized Chit Fund Management system built to handle the complexities of rotating savings groups. It provides a secure, digital environment for auctioning, payment tracking, and dividend distribution.

### Key Information
- **Category**: FinTech / Management Platform
- **Focus**: Community Savings & Automated Auctions
- **Target Audience**: Chit Fund Administrators (G.K Finance)
- **Tagline**: "Accurate Math. Real-time Tracking. Secure Data."

## Website Features & Sections

### 1. Admin Dashboard
- **Overview Stat Cards**: Total active groups, pending payments, and upcoming auctions.
- **Quick Links**: Access to core management modules (Groups, Members, Payments).
- **Recent Activity**: Latest audit logs and member additions.

### 2. Chit Group Management
- **Configuration**: Set total amount, monthly contributions, duration, and commission details.
- **Scheduling**: Automated auction schedule generation based on start date.
- **Status Tracking**: Monitor groups through Pending, Active, and Completed lifecycles.

### 3. Member Registry
- **Directory**: Detailed member profiles with contact info and UPI IDs.
- **Ticket Management**: Linking members to specific tickets within chit groups.
- **Activity History**: View participation and payment history for each member.

### 4. Auction System
- **Bid Recording**: Capture original bids and automatically calculate winning amounts.
- **Dividend Distribution**: Automated calculation of commission, raw dividend, and rounded per-member payouts.
- **Carry Logic**: Precision tracking of "Carry-Next" amounts to be added to subsequent auctions.

### 5. Payment & Tracking
- **Multi-Method Support**: Log payments via Cash, UPI, or Bank Transfer.
- **Status Indicators**: Visual cues for Partial vs. Completed payments.
- **Payment History**: Month-by-month breakdown of contributions and dues.

### 6. Audit Logging
- **Immutable Records**: Action-type tracking (Create, Update, Delete).
- **Detail Logging**: Capturing old and new data snapshots for every sensitive change.
- **Security Info**: IP address and User Agent logging for administrator actions.

## Technical Implementation

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Calculations**: Modular TypeScript Utility Functions
- **Deployment**: Optimized for Enterprise Hosting

### Design Features
- **Modern Finance Aesthetics**: Dark theme with high-contrast status colors.
- **Responsive Layout**: Fully functional on Mobile, Tablet, and Desktop.
- **Data Tables**: Searchable and sortable registries for members and payments.
- **Modal Workflows**: Streamlined data entry for auctions and payments.

### Database Schema (Prisma)
- `User`: Administrator accounts with secure password hashing.
- `Member`: Individual member database with dynamic JSON properties.
- `ChitGroup`: The core entity defining the financial rules of a group.
- `Auction`: Records of every monthly auction, carrying the complex financial snapshots.
- `Payment`: Granular tracking of member contributions.

## Performance & Analytics

### System Accuracy
- **Zero-Error Math**: Floating-point issues avoided through decimal-precision calculations.
- **Rounding Logic**: Configurable (10, 50, 100) to meet organizational needs.
- **Audit Coverage**: 100% of financial modifications captured in logs.

## Future Developments

### Planned Features
- **Mobile PWA**: Installable app for field administrators.
- **SMS Notifications**: Automated reminders for upcoming auctions and dues.
- **Member Portal**: Restrictive access for members to view their own dividends and payments.
- **Advanced Export**: PDF/Excel reports for seasonal accounting.

## Conclusion

BidNest represents the intersection of community tradition and modern engineering. It solves a real-world problem with precision and professionalism, providing a scalable foundation for the next generation of chit fund management.
