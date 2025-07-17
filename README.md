# Astronomical Calendar Website

A comprehensive web-based astronomical calendar system developed for SAASST (Sharjah Academy for Astronomy, Space Sciences and Technology). This full-stack application provides accurate, real-time astronomical event information through an intuitive and responsive interface.

Overview

The Astronomical Calendar Website is a sophisticated platform that integrates multiple astronomical data sources to provide users with comprehensive information about celestial events. Built with modern web technologies, it serves researchers, educators, and astronomy enthusiasts with accurate, location-specific astronomical data.

Key Objectives

• Centralized Platform: Unified access to diverse astronomical event information
• Real-time Data: Automated retrieval and processing of current astronomical data
• User-Friendly Interface: Intuitive design for users of all technical levels
• Educational Resource: Supporting SAASST's mission of astronomical education and research

# Features

Astronomical Events

• Moon Phases: Complete lunar cycle tracking with illumination data
• Solar & Lunar Eclipses: Detailed eclipse information with visibility maps
• Meteor Showers: Peak times, radiant positions, and viewing conditions
• Planetary Events: Conjunctions, oppositions, and visibility periods
• Sunrise/Sunset Times: Location-specific solar data
• Astronomical Twilight: Civil, nautical, and astronomical twilight times

Calendar Features

• Interactive Calendar View: Month, week, and day views with event filtering
• Event Search & Filtering: Advanced search by event type, date range, and location
• Location-based Calculations: Geographic-specific event visibility
• Export Functionality: Calendar integration and data export options
• Responsive Design: Optimized for desktop, tablet, and mobile devices

Technical Features

• Real-time API Integration: Multiple astronomical data sources
• Automated Data Processing: Background tasks for data updates
• Performance Optimization: Efficient database queries and caching
• RESTful API: Comprehensive API for external integrations
• Modern UI/UX: Smooth animations and intuitive navigation

# Technology Stack

Backend

• Framework: Django 5.2.3 with Django REST Framework 3.16.0
• Database: PostgreSQL
• Task Queue: Celery 5.5.3 with Redis 6.2.0
• Astronomical Calculations: Skyfield 1.50 library
• API Integration: Requests 2.32.4 for external data sources
• CORS: Django-cors-headers 4.7.0 for frontend integration

Frontend

• Framework: React 19.1.0 with modern hooks and context
• Build Tool: Vite 6.3.5 for fast development and optimized builds
• Routing: React Router DOM 7.6.2 for seamless navigation
• Styling: Tailwind CSS 4.1.10 for responsive design
• HTTP Client: Axios 1.10.0 for API communication
• UI Components:
  • Lucide React 0.522.0 for icons
  • React DatePicker 8.4.0 for date selection
• Calendar Support: Moment.js 2.30.1 with Hijri calendar support

