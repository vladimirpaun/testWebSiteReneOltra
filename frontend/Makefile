SHELL := /bin/sh

install:
	@npm install

dev:
	@npm run dev

migrate-dev:
	@npx prisma migrate dev

migrate-deploy:
	@npx prisma migrate deploy

seed:
	@npx prisma db seed

build:
	@npm run build

vercel-build:
	@npm run vercel-build

.PHONY: install dev migrate-dev migrate-deploy seed build vercel-build
