shader_type canvas_item;
render_mode blend_add;
// World's Smartest — GPU Radial Energy Burst & Shockwave Ring (Godot 4.7.2 gl_compatibility Web-Safe)
// Fires from tapped answer cards on Correct answers, high Streaks & Bullseye Celebrations!

uniform vec2 center_uv = vec2(0.5, 0.5);
uniform float progress : hint_range(0.0, 1.0) = 0.0;
uniform float aspect_ratio = 1.77777;
uniform vec4 core_color : source_color = vec4(1.0, 0.92, 0.58, 1.0);
uniform vec4 rim_color : source_color = vec4(0.30, 0.94, 0.66, 1.0);
uniform float ray_intensity : hint_range(0.0, 2.0) = 0.45;
uniform float ring_thickness : hint_range(0.01, 0.25) = 0.048;
uniform float max_radius : hint_range(0.2, 1.8) = 0.78;
uniform float strength : hint_range(0.0, 2.0) = 0.65;

void fragment() {
	if (progress <= 0.001 || progress >= 0.999 || strength <= 0.001) {
		COLOR = vec4(0.0);
	} else {
		// Smooth ease-out expansion curve
		float p = clamp(progress, 0.0, 1.0);
		float eased = 1.0 - pow(1.0 - p, 2.65);
		float fade = smoothstep(0.0, 0.08, p) * pow(1.0 - p, 1.45);

		// Aspect-corrected polar coords around impact center_uv
		vec2 d = (UV - center_uv) * vec2(aspect_ratio, 1.0);
		float dist = length(d);
		float ang = atan(d.y, d.x);

		// Primary expanding shockwave ring + sleek incandescent leading ridge
		float cur_r = max(0.02, eased * max_radius);
		float thick = ring_thickness * (0.62 + 0.75 * p);
		float ring_dist = dist - cur_r;
		float ring_main = exp(-pow(ring_dist / max(thick, 0.01), 2.0)) * 0.62;
		float ring_crest = exp(-pow((ring_dist - thick * 0.22) / max(thick * 0.24, 0.006), 2.0)) * 0.54;

		// Delicate trailing secondary harmonic echo ring
		float echo_r = cur_r * 0.72;
		float ring_echo = exp(-pow((dist - echo_r) / max(thick * 0.65, 0.01), 2.0)) * 0.26 * (1.0 - p);

		// Silky volumetric sunburst rays with clean center fade (ZERO dist=0 pinch singularity!)
		float center_smooth = smoothstep(0.03, 0.16, dist);
		float rays_a = pow(0.5 + 0.5 * cos(ang * 12.0 + p * 1.4), 5.0);
		float rays_b = pow(0.5 + 0.5 * cos(ang * 20.0 - p * 2.0 + 0.8), 7.0) * 0.5;
		float ray_falloff = exp(-dist / max(cur_r * 0.85 + 0.06, 0.05)) * (1.0 - smoothstep(cur_r * 0.12, cur_r * 1.25, dist));
		float sunburst = (rays_a + rays_b) * ray_falloff * center_smooth * ray_intensity * (1.0 - p * 0.80);

		// Smooth central ignition bloom (gentle, jewel-warm, never blinding white)
		float flash_env = exp(-p * 7.2);
		float core_flash = exp(-dist * dist * 55.0) * flash_env * 0.78;

		vec3 col = rim_color.rgb * (ring_main + ring_echo + sunburst * 0.52)
			+ core_color.rgb * (ring_crest + sunburst * 0.48 + core_flash);

		float lum = clamp((ring_main + ring_crest + ring_echo + sunburst + core_flash) * fade * strength, 0.0, 0.92);
		COLOR = vec4(clamp(col * fade * strength, vec3(0.0), vec3(0.95)), lum);
	}
}
