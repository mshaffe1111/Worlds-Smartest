"""Helper constructors for authoring verified Gold Venue Question Packs."""
from __future__ import annotations

from typing import Any

DOMAIN_DEFAULT_GLYPH_HINT: dict[int, str] = {
    0: "crown",
    1: "atom",
    2: "globe",
    3: "column",
    4: "mask",
    5: "flame",
    6: "gear",
    7: "dna",
    8: "scales",
    9: "compass",
    10: "scroll",
    11: "prism",
}


def sl(
    dom: int,
    l1: str,
    l2: str,
    topic: str,
    irt_b: float,
    prompt: str,
    answer: str,
    dists: list[str],
    clue_lateral: str,
    clue_pinpoint: str,
    why: str,
    tags: list[str] | None = None,
    tone: str = "PRESTIGE",
    glyph_hint: str | None = None,
    glyph_kw: str = "",
) -> dict[str, Any]:
    plaus = [0.86, 0.79, 0.71, 0.62]
    return {
        "l0Domain": dom,
        "l1Category": l1,
        "l2Subcategory": l2,
        "microTopicId": topic,
        "irtB": round(float(irt_b), 2),
        "irtA": 1.28,
        "archetype": "SIGHTLINE_LOCK",
        "prompt": prompt,
        "answerCorrect": answer,
        "distractors": [
            {"text": d, "plausibility": plaus[i] if i < len(plaus) else 0.58}
            for i, d in enumerate(dists)
        ],
        "clues": [clue_lateral, clue_pinpoint],
        "whyExplanation": why,
        "narrativeTags": tags or ["SOVEREIGN_BLOC"],
        "tone": tone,
        "glyphHint": glyph_hint or DOMAIN_DEFAULT_GLYPH_HINT[dom],
        "_glyphKw": glyph_kw,
    }


def cal(
    dom: int,
    l1: str,
    l2: str,
    topic: str,
    irt_b: float,
    prompt: str,
    exact: int | float,
    unit: str,
    min_val: int | float,
    max_val: int | float,
    step: int | float,
    clue_lateral: str,
    clue_pinpoint: str,
    why: str,
    tags: list[str] | None = None,
    tone: str = "PRESTIGE",
    glyph_hint: str | None = None,
    glyph_kw: str = "",
) -> dict[str, Any]:
    ans_str = f"{exact} {unit}".strip() if unit else str(exact)
    return {
        "l0Domain": dom,
        "l1Category": l1,
        "l2Subcategory": l2,
        "microTopicId": topic,
        "irtB": round(float(irt_b), 2),
        "irtA": 1.32,
        "archetype": "CALIBRATOR_DIAL",
        "prompt": prompt,
        "answerCorrect": ans_str,
        "clues": [clue_lateral, clue_pinpoint],
        "whyExplanation": why,
        "calibratorExt": {
            "exactVal": exact,
            "unit": unit,
            "minVal": min_val,
            "maxVal": max_val,
            "step": step,
        },
        "narrativeTags": tags or ["HORIZON_TECH"],
        "tone": tone,
        "glyphHint": glyph_hint or DOMAIN_DEFAULT_GLYPH_HINT[dom],
        "_glyphKw": glyph_kw,
    }


def gs(
    dom: int,
    l1: str,
    l2: str,
    topic: str,
    irt_b: float,
    statement: str,
    action: str,
    window_sec: int,
    clue_lateral: str,
    clue_pinpoint: str,
    why: str,
    tags: list[str] | None = None,
    tone: str = "PRESTIGE",
    glyph_hint: str | None = None,
    glyph_kw: str = "",
) -> dict[str, Any]:
    act = action.upper()
    if act == "CHALLENGE":
        is_true, is_trick, ans = False, True, "CHALLENGE! (Myth)"
    elif act == "VERIFY":
        is_true, is_trick, ans = True, False, "TRUE"
    else:
        is_true, is_trick, ans = False, False, "FALSE"
    return {
        "l0Domain": dom,
        "l1Category": l1,
        "l2Subcategory": l2,
        "microTopicId": topic,
        "irtB": round(float(irt_b), 2),
        "irtA": 1.24,
        "archetype": "GAUNTLET_SHATTER",
        "prompt": statement,
        "answerCorrect": ans,
        "clues": [clue_lateral, clue_pinpoint],
        "whyExplanation": why,
        "gauntletExt": {
            "isTrue": is_true,
            "isTrick": is_trick,
            "windowSec": window_sec,
        },
        "narrativeTags": tags or ["HIGH_STAKES_BLUFF"],
        "tone": tone,
        "glyphHint": glyph_hint or DOMAIN_DEFAULT_GLYPH_HINT[dom],
        "_glyphKw": glyph_kw,
    }


def cdx(
    dom: int,
    l1: str,
    l2: str,
    topic: str,
    irt_b: float,
    prompt: str,
    answer_label: str,
    pairs: list[tuple[str, str]],
    decoy: str,
    clue_lateral: str,
    clue_pinpoint: str,
    why: str,
    tags: list[str] | None = None,
    tone: str = "PRESTIGE",
    glyph_hint: str | None = None,
    glyph_kw: str = "",
) -> dict[str, Any]:
    return {
        "l0Domain": dom,
        "l1Category": l1,
        "l2Subcategory": l2,
        "microTopicId": topic,
        "irtB": round(float(irt_b), 2),
        "irtA": 1.35,
        "archetype": "CODEX_DUAL_RING",
        "prompt": prompt,
        "answerCorrect": answer_label,
        "clues": [clue_lateral, clue_pinpoint],
        "whyExplanation": why,
        "codexExt": {
            "pairs": [{"subject": s, "target": t} for s, t in pairs],
            "decoyTarget": decoy,
        },
        "narrativeTags": tags or ["LATERAL_DEDUCTION"],
        "tone": tone,
        "glyphHint": glyph_hint or DOMAIN_DEFAULT_GLYPH_HINT[dom],
        "_glyphKw": glyph_kw,
    }


def boss_chain(
    chain_id: str,
    relic_id: str,
    relic_name: str,
    hub: str,
    chain_title: str,
    steps: list[dict[str, Any]],
) -> dict[str, Any]:
    assert len(steps) == 3, f"Boss chain {chain_id} must have exactly 3 steps"
    return {
        "chainId": chain_id,
        "relicId": relic_id,
        "relicName": relic_name,
        "hub": hub,
        "chainTitle": chain_title,
        "steps": steps,
    }
