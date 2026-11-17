import csv

def rank_data(data):
    sorted_data = sorted(list(set(data)))
    rank_map = {val: i + 1 for i, val in enumerate(sorted_data)}
    return [rank_map[x] for x in data]

def spearman_correlation(x, y):
    n = len(x)
    rank_x = rank_data(x)
    rank_y = rank_data(y)
    d_squared = sum((rx - ry) ** 2 for rx, ry in zip(rank_x, rank_y))
    return 1 - (6 * d_squared) / (n * (n**2 - 1))

def mean_absolute_error(actual, predicted):
    return sum(abs(a - p) for a, p in zip(actual, predicted)) / len(actual)

data = []
with open('final_analysis_data.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        data.append({
            'id': row['answer_id'],
            'human1': float(row['human_rater1']),
            'human2': float(row['human_rater2']),
            'gemini': float(row['gemini_score']),
            'heuristic': float(row['heuristic_score'])
        })

for d in data:
    d['human_mean'] = (d['human1'] + d['human2']) / 2
    d['profile'] = d['id'][:3]

human1 = [d['human1'] for d in data]
human2 = [d['human2'] for d in data]
human_mean = [d['human_mean'] for d in data]
gemini = [d['gemini'] for d in data]
heuristic = [d['heuristic'] for d in data]

rho_human = spearman_correlation(human1, human2)
rho_gemini = spearman_correlation(gemini, human_mean)
mae_gemini = mean_absolute_error(gemini, human_mean)
rho_heuristic = spearman_correlation(heuristic, human_mean)
mae_heuristic = mean_absolute_error(heuristic, human_mean)

print("=== CORRELATION & ERROR RESULTS ===")
print(f"Inter-Rater Reliability (Rater 1 vs Rater 2): rho = {rho_human:.3f}")
print(f"Gemini vs Human Mean: rho = {rho_gemini:.3f}, MAE = {mae_gemini:.2f}")
print(f"Heuristic vs Human Mean: rho = {rho_heuristic:.3f}, MAE = {mae_heuristic:.2f}")

print("\n=== BY-PROFILE BREAKDOWN ===")
profiles = {}
for d in data:
    p = d['profile']
    if p not in profiles:
        profiles[p] = {'human': [], 'gemini': [], 'heuristic': []}
    profiles[p]['human'].append(d['human_mean'])
    profiles[p]['gemini'].append(d['gemini'])
    profiles[p]['heuristic'].append(d['heuristic'])

for p in sorted(profiles.keys()):
    h_avg = sum(profiles[p]['human']) / len(profiles[p]['human'])
    g_avg = sum(profiles[p]['gemini']) / len(profiles[p]['gemini'])
    heur_avg = sum(profiles[p]['heuristic']) / len(profiles[p]['heuristic'])
    print(f"Profile {p}: Human Avg = {h_avg:.2f} | Gemini Avg = {g_avg:.2f} | Heuristic Avg = {heur_avg:.2f}")