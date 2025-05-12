# PLANNING.md

## Project Vision

Raffle Ease is a full-stack web application designed to help a local animal rescue association organize and manage raffles used to raise funds for their activities. The application will enable administrators to create raffles, manage ticket sales and orders, view statistics, and handle related administrative tasks efficiently.

## Project Scope

* **Client-side app**: This document focuses on the Angular 18 client.
* **Main user roles**: Association administrators.
* **Key Features (Client Side)**:

  * Raffle management dashboard
  * Tickets orders creation and tracking
  * Data and statistics visualization for raffle
  * Responsive and accessible UI with Tailwind CSS

## Tech Stack

* **Frontend Framework**: Angular 18 (Standalone Components)
* **Styling**: Tailwind CSS
* **Routing**: Angular Router
* **State Management**: Built-in Angular Services (with option to evolve to NgRx or Signals if necessary)
* **Forms**: Angular Reactive Forms
* **API Communication**: HttpClient module to interact with Spring Boot backend
* **Testing**: Jasmine + Karma (unit)

## Backend Interface

* Spring Boot server (already developed separately)
* All client requests will be authenticated and authorized via JWT (stored and managed in frontend)

## Tools & Workflow

* **Version Control**: Git + GitHub
* **Issue Tracking**: TASK.md
* **Build Tools**: Angular CLI

## Constraints & Assumptions

* App must be fully responsive and mobile-friendly
* Must support modern browsers
* All API interactions should gracefully handle errors and timeouts
* Only authorized users can access the app except of the login and register pages
* Data privacy and user feedback are important to maintain trust with users
* Users must receive meaningful feedback when interacting with the app, especially during form submissions, navigation, or errors. This includes showing validation messages, confirmations, loading states, and error notifications.


---

This plan will evolve based on new features and discoveries as development progresses.
