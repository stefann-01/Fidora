# Makefile (place this in the repo root, next to `contracts/` and `backend/`)

.PHONY: compile-contracts

compile-contracts:
	@echo "→ Compiling Solidity in contracts/ …"
	@cd contracts && npx hardhat compile && cd ..

	@echo "→ Ensuring backend/src/config/abi exists…"
	mkdir -p backend/src/config/abi

	@echo "→ Cleaning out old ABIs in backend/src/config/abi/ …"
	rm -f backend/src/config/abi/*.json

	@echo "→ Scanning for artifact JSONs → extracting & writing ABIs…"
	@find contracts/artifacts/contracts -maxdepth 2 -type f -name '*.json' | \
	while read artifact; do \
		contractName=$$(basename $$artifact .json); \
		abi=$$(jq -r '.abi // empty' $$artifact); \
		if [ -n "$$abi" ]; then \
			echo "$$abi" > backend/src/config/abi/$$contractName.json; \
			echo "   • Wrote ABI → backend/src/config/abi/$$contractName.json"; \
		else \
			echo "   • Skipped $$artifact (no .abi field)"; \
		fi; \
	done

	@echo "✅  compile-contracts finished!"
