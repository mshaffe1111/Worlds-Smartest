shader_type canvas_item;
render_mode blend_mix;
// World's Smartest — Live City Weather & Architectural Atmosphere Overlay (Godot 4.7.2 gl_compatibility Web-Safe)
// Modes:
//   0 = ch (Geneva): Alpine drifting snow flecks + cool blue moonlight breath
//   1 = gb / jp / sg (London / Tokyo / Singapore): Diagonal cinematic rain streaks + neon/city bokeh glints
//   2 = eg / br (Cairo / Rio): Rising warm golden sun-dust motes & diagonal sunlit shimmer
//   3 = is (Reykjavik): Flowing emerald-teal-violet Northern Lights aurora ribbon + arctic sparkles
//   4 = global (Apex Forum): Surging championship arena spotlights + dramatic distant storm lightning

uniform int weather_mode = 0;
uniform float intensity : hint_range(0.0, 1.5) = 1.0;
uniform float view_aspect = 1.77777;
uniform float time_sec = 0.0;
uniform vec4 tint_primary : source_color = vec4(0.86, 0.94, 1.0, 1.0);
uniform vec4 tint_secondary : source_color = vec4(0.45, 0.72, 1.0, 1.0);
uniform float lightning_boost : hint_range(0.0, 1.5) = 0.0;

float hash12(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.xx + p3.yz) * p3.zy);
}

float value_noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	float a = hash12(i);
	float b = hash12(i + vec2(1.0, 0.0));
	float c = hash12(i + vec2(0.0, 1.0));
	float d = hash12(i + vec2(1.0, 1.0));
	return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Smooth circular drifting snow flake layer (100% smooth radial circles, ZERO square pixels!)
float snow_layer(vec2 uv, float t, float grid_scale, float fall_speed, float sway_amp, float flake_rad) {
	vec2 p = vec2(uv.x * view_aspect, uv.y) * grid_scale;
	p.y -= t * fall_speed;
	p.x += sin(t * 0.55 + p.y * 0.35) * sway_amp;

	vec2 cell = floor(p);
	vec2 f = fract(p);
	vec2 rnd = hash22(cell);

	// Smooth individual gentle drift inside cell (keeps center away from cell edges)
	vec2 center = vec2(
		0.22 + 0.56 * rnd.x + sin(t * (0.9 + rnd.y) + rnd.x * 6.283) * 0.12,
		0.22 + 0.56 * rnd.y
	);
	float dist = length(f - center);
	float rad = flake_rad * (0.55 + 0.75 * hash12(cell + vec2(17.3, 9.1)));
	float flake = 1.0 - smoothstep(rad * 0.12, rad, dist);
	float sparkle = 0.65 + 0.35 * sin(t * (1.8 + rnd.x * 2.2) + rnd.y * 12.0);
	// Sparse distribution so snow feels poetic and architectural, not noisy TV static
	float keep = step(0.42, hash12(cell + vec2(41.7, 13.9)));
	return flake * sparkle * keep;
}

// Diagonal cinematic glass rain streak layer
float rain_layer(vec2 uv, float t, float cols, float rows, float speed, float slant) {
	vec2 p = vec2(uv.x * view_aspect + uv.y * slant, uv.y);
	vec2 st = vec2(p.x * cols, p.y * rows - t * speed);
	vec2 cell = floor(st);
	vec2 f = fract(st);
	vec2 rnd = hash22(cell);

	float keep = step(0.54, rnd.x);
	float cx = 0.25 + 0.50 * rnd.y;
	float dx = abs(f.x - cx);
	// Crisp razor-thin rain streak with bright leading droplet head & tapered tail
	float head_y = 0.22 + 0.56 * hash12(cell + vec2(5.7, 31.2));
	float dy = head_y - f.y; // positive along trailing tail behind head
	float in_tail = smoothstep(-0.02, 0.02, dy) * (1.0 - smoothstep(0.0, 0.55, dy));
	float width = mix(0.036, 0.010, clamp(dy / 0.55, 0.0, 1.0));
	float streak = (1.0 - smoothstep(width * 0.15, width, dx)) * in_tail;
	// Subtle brighter glint right at the falling droplet head
	float head_glint = (1.0 - smoothstep(0.0, 0.055, length(vec2((f.x - cx) * 1.4, (f.y - head_y) * 2.8)))) * 0.75;
	return (streak + head_glint) * keep;
}

// Rising golden sun-dust mote layer
float dust_layer(vec2 uv, float t, float scale, float rise_speed, float rad_base) {
	vec2 p = vec2(uv.x * view_aspect, uv.y) * scale;
	p.y += t * rise_speed;
	p.x += sin(t * 0.42 + p.y * 0.55) * 0.35;

	vec2 cell = floor(p);
	vec2 f = fract(p);
	vec2 rnd = hash22(cell + vec2(9.2, 23.8));
	float keep = step(0.52, hash12(cell + vec2(77.1, 4.3)));

	vec2 center = vec2(
		0.24 + 0.52 * rnd.x + cos(t * 0.8 + rnd.y * 6.283) * 0.10,
		0.24 + 0.52 * rnd.y
	);
	float dist = length(f - center);
	float rad = rad_base * (0.50 + 0.85 * rnd.y);
	float mote = 1.0 - smoothstep(rad * 0.10, rad, dist);
	float twinkle = 0.45 + 0.55 * sin(t * (1.4 + rnd.x * 2.4) + rnd.y * 19.0);
	return mote * twinkle * keep;
}

void fragment() {
	float t = (time_sec > 0.0) ? time_sec : TIME;
	vec3 col = vec3(0.0);
	float alpha = 0.0;

	if (weather_mode == 0) {
		// GENEVA (ch): Alpine drifting snow flecks + cool silver-blue moonlight breath
		float s_far = snow_layer(UV, t, 14.0, 0.24, 0.28, 0.095) * 0.42;
		float s_mid = snow_layer(UV + vec2(0.37, 0.19), t, 8.5, 0.36, 0.42, 0.115) * 0.72;
		float s_near = snow_layer(UV + vec2(0.71, 0.53), t, 4.8, 0.52, 0.55, 0.145) * 0.58;
		float snow = clamp(s_far + s_mid + s_near, 0.0, 1.0);

		// Cold alpine moonlight breath drifting gently across the upper glass windows
		float moon_breath = (0.55 + 0.45 * sin(t * 0.42)) * (1.0 - smoothstep(0.0, 0.82, UV.y));
		float window_glow = exp(-pow((UV.x - 0.5) * 1.9, 2.0)) * moon_breath * 0.16;

		col = mix(tint_secondary.rgb, tint_primary.rgb, 0.72) * (snow * 0.92 + window_glow);
		alpha = clamp(snow * 0.74 + window_glow * 0.65, 0.0, 0.85);
	} else if (weather_mode == 1) {
		// LONDON (gb) / TOKYO (jp) / SINGAPORE (sg): Diagonal cinematic rain + neon window bokeh glints
		float r1 = rain_layer(UV, t, 18.0, 5.2, 2.85, 0.22) * 0.72;
		float r2 = rain_layer(UV + vec2(0.41, 0.17), t, 28.0, 7.6, 3.65, 0.24) * 0.46;
		float r3 = rain_layer(UV + vec2(0.73, 0.61), t, 11.0, 3.4, 2.10, 0.20) * 0.48;
		float rain = clamp(r1 + r2 + r3, 0.0, 1.0);

		// Wet-glass neon / city bokeh reflections (10 smooth circular optical discs)
		vec3 bokeh_col = vec3(0.0);
		float bokeh_a = 0.0;
		for (int i = 0; i < 10; i++) {
			float fi = float(i) + 1.0;
			float bx = fract(hash12(vec2(fi * 11.7, 3.1)) + sin(t * 0.16 + fi * 1.7) * 0.02);
			float by = 0.12 + 0.62 * hash12(vec2(fi * 23.3, 8.9));
			float br = 0.016 + 0.026 * hash12(vec2(fi * 5.9, 19.4));
			vec2 d = (UV - vec2(bx, by)) * vec2(view_aspect, 1.0);
			float dist = length(d);
			// Soft glass bokeh disc with delicate brighter ring edge
			float disc = (1.0 - smoothstep(br * 0.35, br, dist)) * (0.65 + 0.35 * smoothstep(br * 0.45, br * 0.82, dist));
			float pulse = 0.55 + 0.45 * sin(t * (0.9 + hash12(vec2(fi, 2.0)) * 1.6) + fi * 2.9);
			vec3 b_tint = mix(tint_primary.rgb, tint_secondary.rgb, step(0.5, fract(fi * 0.5)));
			bokeh_col += b_tint * disc * pulse * 0.26;
			bokeh_a += disc * pulse * 0.14;
		}

		vec3 rain_tint = mix(vec3(0.78, 0.88, 1.0), tint_primary.rgb, 0.45);
		col = rain_tint * rain * 0.78 + bokeh_col;
		alpha = clamp(rain * 0.56 + bokeh_a, 0.0, 0.78);
	} else if (weather_mode == 2) {
		// CAIRO (eg) / RIO (br): Rising warm golden dust motes & sunlit architectural shimmer
		float d1 = dust_layer(UV, t, 9.5, 0.11, 0.095) * 0.76;
		float d2 = dust_layer(UV + vec2(0.51, 0.29), t, 15.5, 0.07, 0.080) * 0.52;
		float d3 = dust_layer(UV + vec2(0.19, 0.73), t, 5.5, 0.15, 0.130) * 0.48;
		float motes = clamp(d1 + d2 + d3, 0.0, 1.0);

		// Warm sunlit diagonal volumetric shimmer rays from upper skylight
		float ray_x = UV.x * 1.25 - UV.y * 0.48;
		float ray1 = exp(-pow((ray_x - 0.22 + sin(t * 0.25) * 0.04) * 5.0, 2.0));
		float ray2 = exp(-pow((ray_x - 0.62 + cos(t * 0.20) * 0.05) * 4.2, 2.0));
		float shimmer = (ray1 * 0.65 + ray2 * 0.45) * (1.0 - smoothstep(0.05, 0.95, UV.y)) * (0.75 + 0.25 * sin(t * 0.9 + UV.y * 4.0));

		col = tint_primary.rgb * (motes * 0.95) + mix(tint_primary.rgb, tint_secondary.rgb, 0.35) * (shimmer * 0.24);
		alpha = clamp(motes * 0.72 + shimmer * 0.26, 0.0, 0.82);
	} else if (weather_mode == 3) {
		// REYKJAVIK (is): Flowing emerald-teal-violet Northern Lights aurora ribbon + cold arctic sparkles
		float y_mask = (1.0 - smoothstep(0.04, 0.68, UV.y)) * smoothstep(0.0, 0.12, UV.y);
		vec3 aurora = vec3(0.0);
		float aur_a = 0.0;

		for (int b = 0; b < 3; b++) {
			float fb = float(b);
			float wave = 0.18 + fb * 0.095
				+ 0.065 * sin(UV.x * (3.2 + fb * 1.1) + t * (0.28 + fb * 0.09) + fb * 2.1)
				+ 0.032 * sin(UV.x * 7.8 - t * (0.42 - fb * 0.07) + fb * 1.3);
			float dy = UV.y - wave;
			// Sharp luminous lower aurora edge fading gracefully upward like real magnetic curtains!
			float curtain = exp(-pow(max(dy, 0.0) * 20.0, 2.0)) * exp(-pow(max(-dy, 0.0) * 5.8, 1.4));
			// Vertical glowing solar-wind ray striations drifting horizontally
			float rays = 0.55 + 0.45 * value_noise(vec2(UV.x * (16.0 + fb * 6.0) + t * (0.35 - fb * 0.12), UV.y * 2.2 + fb * 4.0));
			float band = curtain * rays * y_mask;

			// Vertical spectral shift: emerald-teal base -> arctic cyan mid -> soft aurora violet crown!
			vec3 b_col = mix(tint_primary.rgb, tint_secondary.rgb, clamp(-dy * 4.5, 0.0, 1.0));
			b_col = mix(b_col, vec3(0.64, 0.36, 0.96), smoothstep(0.08, 0.24, -dy) * 0.65);
			aurora += b_col * band * (0.42 - fb * 0.08);
			aur_a += band * (0.32 - fb * 0.06);
		}

		// Crisp cold arctic diamond-dust sparkles drifting slowly
		float arctic_dust = snow_layer(UV, t, 12.0, 0.14, 0.20, 0.085) * 0.55;
		col = aurora + vec3(0.75, 0.98, 1.0) * arctic_dust * 0.80;
		alpha = clamp(aur_a + arctic_dust * 0.48, 0.0, 0.78);
	} else {
		// APEX FORUM (global): Surging arena searchlight beams + dramatic distant storm lightning flashes!
		// Dual sweeping golden-platinum championship spotlights from lower flanks
		vec2 p_left = (UV - vec2(0.08, 1.08)) * vec2(view_aspect, 1.0);
		vec2 p_right = (UV - vec2(0.92, 1.08)) * vec2(view_aspect, 1.0);
		float ang_l = atan(p_left.x, -p_left.y);
		float ang_r = atan(p_right.x, -p_right.y);
		float sweep_l = 0.36 + sin(t * 0.58) * 0.24;
		float sweep_r = -0.36 + cos(t * 0.52) * 0.24;
		float beam_l = exp(-pow((ang_l - sweep_l) * 7.5, 2.0)) * (1.0 - smoothstep(0.06, 1.0, UV.y));
		float beam_r = exp(-pow((ang_r - sweep_r) * 7.5, 2.0)) * (1.0 - smoothstep(0.06, 1.0, UV.y));
		float beams = (beam_l + beam_r) * (0.72 + 0.28 * sin(t * 1.9));

		// Periodic dramatic storm sheet-lightning double-flicker every ~6.5 seconds + external trigger
		float cycle = mod(t, 6.5);
		float flash1 = exp(-pow((cycle - 1.10) * 14.0, 2.0));
		float flash2 = exp(-pow((cycle - 1.32) * 18.0, 2.0)) * 0.85;
		float storm_flash = clamp((flash1 + flash2) * 0.75 + lightning_boost, 0.0, 1.25);

		// Distant forked atmospheric lightning crackle silhouette in upper sky during flash
		float bolt_x = 0.5 + 0.26 * sin(floor(t / 6.5) * 4.7);
		float jag = (value_noise(vec2(UV.y * 18.0, floor(t / 6.5) * 7.3)) - 0.5) * 0.085;
		float bolt = exp(-abs(UV.x - (bolt_x + jag)) * 120.0) * (1.0 - smoothstep(0.05, 0.56, UV.y)) * storm_flash;
		float sheet = (1.0 - smoothstep(0.0, 0.75, UV.y)) * exp(-pow((UV.x - bolt_x) * 1.6, 2.0)) * storm_flash * 0.38;

		// Rising electrified gold-violet apex sparks
		float sparks = dust_layer(UV, t, 10.5, 0.24, 0.090) * 0.65;

		col = tint_primary.rgb * (beams * 0.30 + sparks * 0.85)
			+ mix(vec3(0.84, 0.90, 1.0), tint_secondary.rgb, 0.38) * (sheet + bolt * 1.35);
		alpha = clamp(beams * 0.28 + sheet * 0.72 + bolt * 0.90 + sparks * 0.52, 0.0, 0.86);
	}

	COLOR = vec4(clamp(col, vec3(0.0), vec3(1.0)), clamp(alpha * intensity, 0.0, 0.92));
}
