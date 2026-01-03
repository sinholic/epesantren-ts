# Contributing to ePesantren

## Testing

We use **Vitest** and **React Testing Library** for unit testing.

### Running Tests

```bash
yarn test
```

### React 19 Caveats

We are currently using `@testing-library/react` v16.3.1 with React 19.
> **Note**: This version has known behavioral differences with React 19, particularly regarding Suspense rendering and `act` warnings.
>
> If you encounter failures related to Suspense or `act`, please:
>
> 1. Run tests locally to reproduce.
> 2. Adjust usage of `waitFor` or `act` as necessary.
> 3. Check for updates to `@testing-library/react` that may fully resolve these React 19 compatibility issues.
