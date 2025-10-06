# AbateIQ - Industrial Hygiene Platform

Welcome to AbateIQ, a modern, AI-powered platform designed for industrial hygienists and environmental consultants. This application, built with Next.js and Firebase, streamlines project management, data collection, and report generation, allowing you to focus on what matters most: ensuring workplace safety.

## Key Features

- **Dashboard**: Get an at-a-glance overview of active projects, recent air sample results, and critical exposure exceedances as soon as you log in.

- **Project Management**: Create and manage client projects, track key dates, and link all relevant data, including air samples and surveys, in one centralized location.

- **Air Monitoring**: A comprehensive module to log, import, and manage air monitoring samples. Filter and search through extensive datasets with ease. Supports bulk import from Excel to save time.

- **Personnel Management**: Keep track of all personnel, including their certifications, fit test due dates, and exposure history.

- **Hazardous Material Surveys**: Conduct detailed surveys for materials like asbestos and lead. The system includes dynamic tables to manage:
    - Functional Areas (e.g., kitchens, offices)
    - Homogeneous Areas (e.g., "12x12 Vinyl Floor Tile")
    - Asbestos & Paint Sample Logs

- **AI-Powered Reporting**: Leverage the power of generative AI to instantly create professional, comprehensive survey reports from the data you've collected.

- **AI-Powered NEA Tool**: Generate draft Negative Exposure Assessments (NEAs) in seconds by providing project and task descriptions.

- **AI Document Analysis**: Upload lab reports in PDF format and receive an AI-generated summary, including a list of any detected exceedances, saving you valuable review time.

- **Industrial Hygiene Tools**: A suite of built-in calculators to assist with daily tasks:
    - **TWA Calculator**: For calculating Time-Weighted Averages.
    - **Unit Converter**: Convert between common IH units like mg/m³ and ppm.
    - **Ventilation Calculator**: Determine required CFM for a target ACH.
    - **Heat Stress (WBGT) Calculator**: Assess heat stress risk with optional weather data integration.
    - **PPE Calculator**: Estimate in-mask concentrations and effective TWA.

- **Robust Settings & Admin Panel**:
    - Manage company branding, including logos and colors.
    - Control user accounts, roles, and feature-level permissions.
    - Configure system-wide settings and integrations.

## Getting Started

1.  **Run the application**:
    ```bash
    npm run dev
    ```
    This will start the development server, typically on `http://localhost:9002`.

2.  **Explore the App**:
    - Navigate to the **Dashboard** to see an overview.
    - Go to **Projects** to create or view a project.
    - Visit the **Surveys** page to start a new survey or manage existing ones.
    - Check out the **Tools** section for helpful calculators.

This application is built on a modern tech stack, including Next.js, React, Tailwind CSS, and Firebase for the backend and authentication.
