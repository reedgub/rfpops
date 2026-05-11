.PHONY: install test web sample clean lint

install:
	pip install -e ".[dev]"
	cd web && npm install

test:
	pytest --cov=core --cov-report=term-missing -v

web:
	cd web && npm run dev

sample:
	@echo "Running /evaluate on fixture RFP..."
	python -c "
from pathlib import Path
from core.intake import parse_rfp
from core.profile import load_profile
from core.scoring import score_rfp
from core.claude_client import ClaudeClient
from core.storage import save_evaluation, save_extracted, slugify
from dotenv import load_dotenv
load_dotenv()
# Find first fixture PDF
import glob
pdfs = glob.glob('tests/fixtures/*/source.pdf')
if not pdfs:
    print('No fixture PDFs found. Run: python scripts/fetch_samples.py')
    exit(1)
pdf = pdfs[0]
print(f'Evaluating: {pdf}')
rfp = parse_rfp(pdf)
profile = load_profile(Path('profile'))
client = ClaudeClient()
evaluation = score_rfp(rfp, profile, client)
slug = slugify(rfp.title, rfp.notice_id)
save_extracted(slug, rfp)
save_evaluation(slug, evaluation)
print(f'Verdict: {evaluation.verdict} | Score: {evaluation.composite_score}/5.0')
print(f'Saved to rfps/{slug}/')
"

clean:
	rm -rf rfps/*/
	touch rfps/.gitkeep
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache
	rm -rf web/.next
	rm -rf core/*.egg-info

lint:
	python -m py_compile core/*.py && echo "Syntax OK"
