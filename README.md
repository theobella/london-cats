# London Cats Aggregator 🐱

A centralized platform for finding adoptable cats in London, aggregating data from **Battersea Dogs & Cats Home** and **Cats Protection**.

## Features

-   **Multi-Source Aggregation**: unified view of cats from multiple shelters.
-   **Metrics Dashboard**: Tracks "Length of Stay", adoption rates, and demographics to help potential adopters find long-stay cats.
-   **Smart Persistence**: A custom backend scraper that remembers when cats were first listed to calculate accurate wait times over time.
-   **Data Enrichment**: Automatically tags cats with "Indoor-Only", "Health Status", etc., based on their descriptions.
-   **Robust Image Handling**: Local caching and proxying strategies to ensure images always load.

## Getting Started

### Prerequisites

-   Node.js (v18+)

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd london-cats
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Scraper

To fetch the latest cats and update the local database:

```bash
node scripts/scrape.js
```

### Running the App

```bash
npm run dev
```

The app will run at `http://localhost:5173`.

## Architecture

-   **Frontend**: React (Vite)
-   **Data Storage**: File-based JSON (`src/data/realCats.json`). See `migration_guide.md` for scaling instructions.
-   **Styling**: Pure CSS with Glassmorphism design system.
