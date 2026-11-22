class_name ShareClipboard
extends RefCounted
## Reliable One-Tap Clipboard Bridge (Native Android/Desktop + Web Chrome/Safari) &
## Viral 5-Line Zero-Spoiler Daily Share Card Generator (Research #2 §5.2–5.3 & Research #1 R1-09).

const LAUNCH_EPOCH_UNIX: int = 1782864000 # 2026-07-01 00:00:00 UTC


static func get_daily_edition_number() -> int:
	var now_utc: int = int(Time.get_unix_time_from_system())
	var days: int = int(floor(float(now_utc - LAUNCH_EPOCH_UNIX) / 86400.0)) + 1
	return maxi(1, days)


static func glyph_for_outcome(outcome: Dictionary) -> String:
	var correct: bool = bool(outcome.get("correct", false))
	var backfired: bool = bool(outcome.get("backfired", false))
	var bullseye: bool = bool(outcome.get("bullseye", false))
	var overclocked: bool = bool(outcome.get("overclocked", false))
	var peel_tier: int = int(outcome.get("peel_tier", 1))
	if (not correct) and backfired:
		return "💥"
	if not correct:
		return "⬛"
	if bullseye:
		return "🎯"
	if overclocked and peel_tier <= 1:
		return "💎"
	if peel_tier <= 1:
		return "🟨"
	if peel_tier == 2:
		return "🟩"
	return "🟦"


static func estimate_top_percentile(score: int, correct_count: int, total_count: int) -> int:
	var acc_ratio: float = float(correct_count) / maxf(1.0, float(total_count))
	var score_norm: float = clampf(float(score) / 22000.0, 0.0, 1.0)
	var composite: float = clampf(acc_ratio * 0.55 + score_norm * 0.45, 0.0, 1.0)
	# Maps strong runs cleanly to Top 1%..Top 45%
	var top_pct: int = clampi(int(round(lerpf(62.0, 1.0, pow(composite, 1.35)))), 1, 75)
	return top_pct


static func format_commas(val: int) -> String:
	var neg: bool = val < 0
	var s: String = str(absi(val))
	var out: String = ""
	var count: int = 0
	for i: int in range(s.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			out = "," + out
		out = s[i] + out
		count += 1
	return ("-" + out) if neg else out


static func format_daily_share_card(outcomes: Array[Dictionary], total_score: int, best_streak: int) -> String:
	var edition: int = get_daily_edition_number()
	var strip: String = ""
	var solved: int = 0
	var overclocks: int = 0
	for o: Dictionary in outcomes:
		strip += glyph_for_outcome(o)
		if bool(o.get("correct", false)):
			solved += 1
			if bool(o.get("overclocked", false)):
				overclocks += 1
	var total: int = maxi(1, outcomes.size())
	var top_pct: int = estimate_top_percentile(total_score, solved, total)
	var score_str: String = format_commas(maxi(0, total_score))

	# Exact 5-Line Zero-Spoiler Full-Width Color Emoji Strip (Research #2 §5.2 & Gate 3 #14)
	return "WORLD'S SMARTEST · #%d\n🏆 %s · Top %d%%\n\n%s\n\n%d/%d · ⚡%d Overclocks · 🔥%d Streak" % [
		edition,
		score_str,
		top_pct,
		strip,
		solved,
		total,
		overclocks,
		best_streak,
	]


static func copy_text(text: String) -> bool:
	if DisplayServer.get_name() == "headless":
		return true
	if not OS.has_feature("web"):
		DisplayServer.clipboard_set(text)
		return true
	var escaped: String = JSON.stringify(text)
	var js: String = """
	(function(txt){
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(txt).catch(function(){
				var ta = document.createElement('textarea');
				ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
				document.body.appendChild(ta); ta.focus(); ta.select();
				try { document.execCommand('copy'); } catch(e) {}
				document.body.removeChild(ta);
			});
			return true;
		}
		var ta = document.createElement('textarea');
		ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
		document.body.appendChild(ta); ta.focus(); ta.select();
		var ok = false;
		try { ok = document.execCommand('copy'); } catch(e) {}
		document.body.removeChild(ta);
		return ok;
	})(%s);
	""" % escaped
	JavaScriptBridge.eval(js)
	return true
