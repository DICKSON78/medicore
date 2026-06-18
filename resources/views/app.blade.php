<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Primary Meta Tags -->
    <title>Medicore Dental Clinic - Your Smile, Our Priority | Dental Clinic in Tanzania</title>
    <meta name="title" content="Medicore Dental Clinic - Your Smile, Our Priority | Dental Clinic in Mwanza, Tanzania">
    <meta name="description" content="Medicore Dental Clinic - Your trusted partner for comprehensive dental health. Expert general dentistry, oral surgery, orthodontics, and more.">
    <meta name="keywords" content="dental clinic, dentist, oral health, dental care, teeth cleaning, root canal, tooth extraction, dental clinic Mwanza Tanzania, orthodontics, dental implants, Medicore Dental">
    <meta name="author" content="Medicore Dental Clinic">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">
    <meta name="geo.region" content="TZ-18">
    <meta name="geo.placename" content="Mwanza, Tanzania">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://medicore-dental.co.tz/">
    <meta property="og:title" content="Medicore Dental Clinic - Your Smile, Our Priority">
    <meta property="og:description" content="Your trusted partner for comprehensive dental health in Natta-Mwanza, Tanzania. Expert general dentistry, oral surgery, orthodontics, and more.">
    <meta property="og:image" content="{{ asset('images/logo.png') }}">
    <meta property="og:site_name" content="Medicore Dental Clinic">
    <meta property="og:locale" content="en_US">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://medicore-dental.co.tz/">
    <meta property="twitter:title" content="Medicore Dental Clinic - Your Smile, Our Priority">
    <meta property="twitter:description" content="Your trusted partner for comprehensive dental health in Natta-Mwanza, Tanzania.">
    <meta property="twitter:image" content="{{ asset('images/logo.png') }}">

    <!-- Canonical URL -->
    <link rel="canonical" href="https://medicore-dental.co.tz{{ request()->path() === '/' ? '' : '/' . request()->path() }}">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="apple-touch-icon" href="{{ asset('images/logo.png') }}">

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "Medicore Dental Clinic",
      "description": "Your trusted partner for comprehensive dental health in Natta-Mwanza, Tanzania",
      "url": "https://medicore-dental.co.tz",
      "logo": "https://medicore-dental.co.tz/images/logo.png",
      "image": "https://medicore-dental.co.tz/images/logo.png",
      "telephone": "+255678110376",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Natta-Mwanza",
        "addressRegion": "Mwanza",
        "addressCountry": "TZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "-2.5164",
        "longitude": "32.9176"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "08:00",
        "closes": "17:00"
      },
      "priceRange": "$$",
      "medicalSpecialty": "Dentistry",
      "serviceType": [
        "General Dentistry",
        "Oral Surgery",
        "Root Canal Treatment",
        "Teeth Cleaning & Scaling",
        "Orthodontics",
        "Dental Crowns & Bridges",
        "Pediatric Dentistry",
        "Dental Implants"
      ]
    }
    </script>

    <link href="{{ \Illuminate\Support\Facades\URL::to('/') . '/css/fonts.css' }}" rel="stylesheet">

    @env('local')
        @viteReactRefresh
    @endenv
    @vite(['resources/js/app.jsx'])

    <style>
               #root {
                   min-height: 100vh;
                   display: flex;
                   flex-direction: column;
                   align-items: center;
                   justify-content: center;
                   background: transparent;
                   font-family: 'Roboto', 'Open Sans', sans-serif;
               }
    </style>
</head>
<body>
<noscript>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>JavaScript Required</h1>
        <p>You need to enable JavaScript to run this application.</p>
    </div>
</noscript>
<div id="root"></div>
</body>
</html>
