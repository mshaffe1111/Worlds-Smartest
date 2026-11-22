shader_type canvas_item;
// World's Smartest — Animated 24K Metallic Gold-Foil Specular Sheen (Godot 4.7.2 gl_compatibility Web-Safe)
// Safe on Buttons, NinePatch Panels, TextureRects & Streak Badges without distorting NinePatch UVs or washing out dark ink.

uniform float sheen_speed : hint_range(0.1, 3.0) = 0.62;
uniform float sheen_interval : hint_range(1.2, 10.0) = 3.8;
uniform float sheen_width : hint_range(0.04, 0.45) = 0.14;
uniform float sheen_angle : hint_range(-1.2, 1.2) = 0.42;
uniform float sheen_intensity : hint_range(0.0, 1.5) = 0.34;
uniform float hover_boost : hint_range(0.0, 1.0) = 0.0;
uniform float manual_sweep_t : hint_range(-1.0, 1.5) = -1.0;
uniform float coord_scale : hint_range(0.0004, 0.01) = 0.00185;
uniform float use_uv_coords : hint_range(0.0, 1.0) = 0.0;
uniform vec4 sheen_color : source_color = vec4(1.0, 0.96, 0.80, 1.0);
uniform vec4 rim_color : source_color = vec4(1.0, 0.86, 0.48, 1.0);

varying vec2 v_local_pos;
varying vec4 v_modulate;

void vertex() {
	v_local_pos = VERTEX;
	v_modulate = COLOR;
}

void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	vec4 base = tex * v_modulate;

	// Continuous diagonal sweep coordinate (pixel-space avoids NinePatch UV seams!)
	vec2 p_local = v_local_pos * coord_scale;
	vec2 p = mix(p_local, UV, use_uv_coords);
	float diag = p.x * cos(sheen_angle) + p.y * sin(sheen_angle);

	// Sweep phase: either periodic automatic studio glint or explicit hover trigger [0..1]
	float sweep_pos = -0.6;
	float active_env = 1.0;
	if (manual_sweep_t >= 0.0) {
		sweep_pos = mix(-0.35, 1.45, clamp(manual_sweep_t, 0.0, 1.0));
		active_env = sin(clamp(manual_sweep_t, 0.0, 1.0) * 3.14159265);
	} else {
		float cycle = mod(TIME * sheen_speed, sheen_interval);
		float t = clamp(cycle / 1.15, 0.0, 1.0);
		// Smooth ease-in-out sweep across the surface, quiet during rest of interval
		float eased = t * t * (3.0 - 2.0 * t);
		sweep_pos = mix(-0.42, 1.55, eased);
		active_env = step(cycle, 1.15) * sin(t * 3.14159265);
	}

	float d = diag - sweep_pos;
	// Primary broad champagne specular band + crisp trailing platinum micro-glint
	float band_main = exp(-pow(d / max(sheen_width, 0.02), 2.0));
	float band_sharp = exp(-pow((d + sheen_width * 0.34) / max(sheen_width * 0.24, 0.012), 2.0)) * 0.72;
	float glint = (band_main + band_sharp) * active_env;

	// Subtle hover metallic warmth & specular edge breathing
	float breath = 0.5 + 0.5 * sin(TIME * 2.6 + diag * 3.5);
	float hover_glow = hover_boost * (0.055 + 0.045 * breath);

	// Strictly protect dark high-contrast text ink (#11151E) so CTA letters NEVER wash out during sheen sweep!
	float luma = dot(base.rgb, vec3(0.299, 0.587, 0.114));
	float metal_weight = smoothstep(0.18, 0.36, luma);

	vec3 add_sheen = sheen_color.rgb * glint * (sheen_intensity + hover_boost * 0.22) * metal_weight;
	vec3 add_hover = rim_color.rgb * hover_glow * metal_weight;

	vec3 final_rgb = clamp(base.rgb + add_sheen + add_hover, vec3(0.0), vec3(1.0));
	COLOR = vec4(final_rgb, base.a);
}
