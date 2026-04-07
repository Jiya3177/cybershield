def normalize_reward(raw_reward, lower_bound=-0.5, upper_bound=1.5):
    """Map a raw reward to the stable [0, 1] range without changing internal logic."""
    if upper_bound <= lower_bound:
        return 0.0

    clamped = max(lower_bound, min(upper_bound, raw_reward))
    normalized = (clamped - lower_bound) / (upper_bound - lower_bound)
    return round(normalized, 4)


def normalize_average_reward(total_reward, steps):
    if steps <= 0:
        return 0.0
    return round(max(0.0, min(1.0, total_reward / steps)), 4)
