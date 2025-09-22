# Copilot Instructions for absen-guru

## Project Overview

`absen-guru` is an attendance management system designed for educational institutions, focusing on teacher attendance tracking and management.

## Architecture Guidelines

### Core Domain Concepts

- **Attendance Records**: Central entity tracking presence/absence with timestamps
- **Users**: Teachers, administrators, and possibly students
- **Schedules**: Class schedules and attendance requirements
- **Reports**: Analytics and summaries for administrative purposes

### Expected Component Structure

When developing this system, consider these typical components:

- **Authentication & Authorization**: Role-based access (admin, teacher, student)
- **User Management**: Profile management and role assignment
- **Attendance Tracking**: Check-in/out functionality with location validation
- **Scheduling System**: Class schedules and attendance requirements
- **Reporting Engine**: Generate attendance reports and analytics
- **Notification System**: Alerts for absences and schedule changes

### Svelte + DaisyUI Implementation Patterns

- **Attendance Forms**: Use DaisyUI 5.1.13 form components with Svelte's bind directives
- **Data Tables**: Implement attendance lists using DaisyUI table classes with Svelte's reactive filtering
- **Dashboard Cards**: Use DaisyUI card components for attendance statistics and summaries
- **Modal Dialogs**: DaisyUI modals for attendance confirmation and editing
- **Navigation**: DaisyUI navbar and drawer components for role-based menu systems
- **Theming**: Define themes using @theme {} block in CSS, not JavaScript config
- **Animations**: Use custom CSS animations defined in @theme {} with CSS variables
- **Package Management**: Always use pnpm commands (pnpm install, pnpm dev, pnpm build)

## Technology Stack

### Frontend Framework

This project uses **Svelte** with **DaisyUI 5.1.13** and **TailwindCSS 4.0** for the user interface. Before working on this project:

1. **Study Svelte Documentation**: Read and internalize https://svelte.dev/llms-full.txt
2. **Study DaisyUI Documentation**: Read and internalize https://daisyui.com/llms.txt
3. **Apply as Reference**: Use these documentation sources as permanent reference throughout development

### Key Framework Principles

- Follow Svelte's reactive patterns and component lifecycle
- Use DaisyUI 5.1.13 classes for consistent UI components and theming
- Leverage TailwindCSS 4.0 features with @import and @theme approach (no config files)
- Implement Svelte stores for state management across attendance tracking
- Leverage SvelteKit for routing and server-side functionality
- Use pnpm as package manager for better performance and disk efficiency

### TailwindCSS v4 + DaisyUI Implementation Patterns

- **Package Installation**: Always use `pnpm install tailwindcss@latest @tailwindcss/vite@latest daisyui@latest`
- **Vite Configuration**: Use `tailwindcss()` plugin BEFORE `sveltekit()` plugin
- **CSS Import**: Use `@import "tailwindcss";` and `@plugin "daisyui";` (NOT @tailwind directives)
- **No Config File**: TailwindCSS v4 doesn't need tailwind.config.js file
- **CSRF Fix**: Use `csrf: { trustedOrigins: ['http://localhost:5173', 'http://localhost:5174'] }` instead of `checkOrigin: false`
- **Cache Clear**: If build issues, clear `node_modules/.vite` and `.svelte-kit` folders
- **Port Fix**: Use `--port` flag to avoid conflicts: `pnpm dev --port 5174`

## Development Conventions

### Language Considerations

- Project name suggests Indonesian context ("absen" = attendance, "guru" = teacher)
- Consider internationalization needs from the start
- Use English for code, Indonesian for user-facing content where appropriate

### Data Modeling Best Practices

- Include timezone handling for attendance timestamps
- Implement soft deletes for attendance records (audit trail)
- Consider academic calendar periods (semesters, terms)
- Plan for different attendance policies (grace periods, excused absences)

### Security & Privacy

- Protect personal information (PII) according to local regulations
- Implement location validation for check-ins if required
- Audit logs for attendance modifications
- Role-based permissions for viewing/editing attendance data

## Key Development Areas

### Mobile-First Considerations

- Attendance systems often require mobile access
- Consider offline-first architecture for unreliable connectivity
- GPS/location services for attendance verification
- Push notifications for schedule reminders

### Integration Points

- **Academic Information Systems**: Student/teacher data sync
- **HR Systems**: Employee data and schedule integration
- **Calendar Systems**: Schedule management and conflicts
- **Reporting Tools**: Export to Excel, PDF generation
- **Communication Platforms**: Email/SMS notifications

### Performance Considerations

- Optimize for high-frequency attendance submissions
- Efficient querying for date-range reports
- Consider caching for frequently accessed schedules
- Database indexing on user_id, date, and status fields

## Testing Strategy

- Unit tests for business logic (attendance calculations, policy validation)
- Integration tests for external system connections
- End-to-end tests for critical user flows (check-in/out, report generation)
- Performance tests for concurrent attendance submissions

## Deployment Considerations

- Consider educational institution schedules for deployments
- Backup strategies for attendance data
- Monitoring for system availability during peak usage (class start times)
- Data retention policies for historical records

---

_This file will be updated as the project evolves. Update these instructions when architectural decisions are made or patterns emerge._
