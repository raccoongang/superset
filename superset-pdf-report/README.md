# Superset Report generator Server

A Node.js Report generator server for generating PDF version of dashboard panels.

## Requirements

- Node.js 14+ (not tested with older versions)


## Install

Install dependencies:
```
npm ci
```

## Superset Configuration

To configure server see configs for all stages here `config/`

## Running

Running locally via dev server:
```
npm run start:dev
```

Running in production:
```
npm ci
```

## Health check

The WebSocket server supports health checks via one of:

```
GET /health
```

OR

```
HEAD /health
```
