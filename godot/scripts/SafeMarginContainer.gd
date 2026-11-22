class_name SafeMarginContainer
extends MarginContainer
## Dual-Platform Hardware Safe-Area Container for World's Smartest (Godot 4.7.2).
## Respects Android/iOS DisplayServer.get_display_safe_area() AND Web HTML5 CSS env(safe-area-inset-*).
## Enforces minimum floors (Top: 72, Bottom: 56, Sides: 48) on 1080x1920 reference canvas so ZERO buttons clip!

const FLOOR_TOP: int = 72
const FLOOR_BOTTOM: int = 56
const FLOOR_SIDE: int = 48


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	get_viewport().size_changed.connect(_apply_safe_margins)
	call_deferred("_apply_safe_margins")


func _apply_safe_margins() -> void:
	var left: float = float(FLOOR_SIDE)
	var right: float = float(FLOOR_SIDE)
	var top: float = float(FLOOR_TOP)
	var bottom: float = float(FLOOR_BOTTOM)

	if OS.has_feature("mobile") and not OS.has_feature("web"):
		var safe_rect: Rect2 = Rect2(DisplayServer.get_display_safe_area())
		if safe_rect.size.x > 0.0 and safe_rect.size.y > 0.0:
			var xform_inv: Transform2D = get_viewport().get_final_transform().affine_inverse()
			var vp_safe: Rect2 = safe_rect * xform_inv
			var vp_full: Rect2 = get_viewport().get_visible_rect()
			left = maxf(left, vp_safe.position.x - vp_full.position.x + 24.0)
			top = maxf(top, vp_safe.position.y - vp_full.position.y + 18.0)
			right = maxf(right, vp_full.end.x - vp_safe.end.x + 24.0)
			bottom = maxf(bottom, vp_full.end.y - vp_safe.end.y + 18.0)
	elif OS.has_feature("web"):
		var raw: Variant = JavaScriptBridge.eval("window.__wsSafeInsets ? window.__wsSafeInsets() : ''")
		if raw is String and not (raw as String).is_empty():
			var parsed: Variant = JSON.parse_string(raw as String)
			if parsed is Dictionary:
				var d: Dictionary = parsed as Dictionary
				var scale_y: float = get_viewport().get_visible_rect().size.y / maxf(1.0, float(d.get("vh", 1920)))
				top = maxf(top, float(d.get("top", 0)) * scale_y + 18.0)
				bottom = maxf(bottom, float(d.get("bottom", 0)) * scale_y + 18.0)

	begin_bulk_theme_override()
	add_theme_constant_override("margin_left", roundi(left))
	add_theme_constant_override("margin_top", roundi(top))
	add_theme_constant_override("margin_right", roundi(right))
	add_theme_constant_override("margin_bottom", roundi(bottom))
	end_bulk_theme_override()
