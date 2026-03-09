"""ResourceMatch CEO Bot — interactive strategic advisor powered by Claude.

Usage:
    python -m scripts.ceo.main                  # Interactive mode
    python -m scripts.ceo.main "your question"   # Single question mode
    python -m scripts.ceo.main --review          # Weekly review
    python -m scripts.ceo.main --deep "question" # Deep analysis mode
    python -m scripts.ceo.main --outreach        # Maya outreach status
"""

import sys
import logging

from scripts.seo.logging_setup import setup_logging

setup_logging("ceo")
logger = logging.getLogger(__name__)


def ask(question, deep=False):
    """Ask the CEO bot a strategic question and get a response."""
    import anthropic

    from scripts.ceo.config import get_anthropic_key, DEFAULT_MODEL, DEEP_STRATEGY_MODEL
    from scripts.ceo.system_prompt import build_system_prompt

    client = anthropic.Anthropic(api_key=get_anthropic_key())
    system = build_system_prompt(deep=deep)
    model = DEEP_STRATEGY_MODEL if deep else DEFAULT_MODEL

    response = client.messages.create(
        model=model,
        max_tokens=4096 if deep else 2000,
        system=system,
        messages=[{"role": "user", "content": question}],
    )

    return response.content[0].text


def _show_outreach_status():
    """Show Maya's outreach status and current directive."""
    print()
    print("--- Maya (Outreach Agent) Status ---")
    try:
        from scripts.ceo.system_prompt import load_outreach_status
        status = load_outreach_status()
        print(status)
    except Exception as e:
        print(f"Could not load outreach status: {e}")
    print()


def interactive():
    """Run the CEO bot in interactive mode."""
    print()
    print("=" * 60)
    print("  RESOURCEMATCH STRATEGIC DIRECTOR")
    print("  Commands: 'quit', 'review', 'metrics', 'outreach', 'deep <question>'")
    print("=" * 60)
    print()

    history = []

    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            break

        if not question:
            continue
        if question.lower() in ("quit", "exit", "q"):
            print("Goodbye.")
            break
        if question.lower() == "review":
            from scripts.ceo.weekly_review import print_weekly_review
            print_weekly_review()
            continue
        if question.lower() == "metrics":
            from scripts.ceo.metrics import format_variance_report
            print()
            print(format_variance_report())
            print()
            continue
        if question.lower() == "outreach":
            _show_outreach_status()
            continue

        deep = question.lower().startswith("deep ")
        if deep:
            question = question[5:]

        try:
            print()
            response = ask(question, deep=deep)
            print(f"Director: {response}")
            print()
            history.append({"q": question, "a": response})
        except Exception as e:
            logger.error("Error: %s", e)
            print(f"Error: {e}")
            print()


def main():
    args = sys.argv[1:]

    if not args:
        interactive()
        return

    if args[0] == "--review":
        from scripts.ceo.weekly_review import print_weekly_review
        print_weekly_review()
        return

    if args[0] == "--outreach":
        _show_outreach_status()
        return

    if args[0] == "--deep" and len(args) > 1:
        question = " ".join(args[1:])
        response = ask(question, deep=True)
        print(response)
        return

    question = " ".join(args)
    response = ask(question)
    print(response)


if __name__ == "__main__":
    main()
