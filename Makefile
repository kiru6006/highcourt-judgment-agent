PYTHON := .venv/bin/python
NODE := $(shell which node 2>/dev/null || echo "/Users/apple/.nvm/versions/node/v24.11.1/bin/node")

.PHONY: all spike clean

all: spike

spike:
	@echo "=== Running NyayaReader Phase 2 Data Spike ==="
	@mkdir -p config docs
	@echo "1. S3 Metadata Probe..."
	$(PYTHON) pipeline/spike/s3_metadata_probe.py
	@echo "2. PDF Extraction & Quality Probe..."
	$(PYTHON) pipeline/spike/pdf_extract_probe.py
	@echo "3. Size & Budget Modeling Probe..."
	$(PYTHON) pipeline/spike/size_model_probe.py
	@echo "4. Hosting & CORS Matrix Probe..."
	$(PYTHON) pipeline/spike/hosting_cors_probe.py
	@echo "5. Vector Dot-Product Throughput Probe..."
	$(NODE) pipeline/spike/embed_throughput_probe.js
	@echo "=== Spike Execution Completed Successfully ==="

clean:
	rm -rf pipeline/tmp/
