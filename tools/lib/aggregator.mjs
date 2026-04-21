export function aggregate(recruiter, hiringManager, barRaiser) {
  const stubbed = [recruiter, hiringManager, barRaiser].some(
    (p) => !p || p.decision === 'stub',
  );
  if (stubbed) {
    return {
      verdict: 'incomplete_simulation',
      one_line: 'Partial run: at least one persona is stubbed.',
      weakest_link: null,
      fix_checklist: [],
    };
  }

  if (recruiter.decision === 'fail') {
    return {
      verdict: 'skip',
      one_line: `Recruiter kill: ${recruiter.kill_reason ?? 'unspecified'}`,
      weakest_link: 'recruiter',
      fix_checklist: [],
    };
  }
  if (hiringManager.decision === 'fail') {
    return {
      verdict: 'apply_with_caveats',
      one_line: `HM concern: ${hiringManager.kill_reason ?? 'unspecified'}`,
      weakest_link: 'hiring_manager',
      fix_checklist: [],
    };
  }
  if (barRaiser.decision === 'no_go') {
    return {
      verdict: 'apply',
      one_line: `Bar raiser no-go: ${barRaiser.rationale ?? 'unspecified'}`,
      weakest_link: 'bar_raiser',
      fix_checklist: [],
    };
  }
  if (barRaiser.decision === 'go_if_fixed') {
    return {
      verdict: 'apply',
      one_line: `Bar raiser conditional: ${barRaiser.rationale ?? 'unspecified'}`,
      weakest_link: 'bar_raiser',
      fix_checklist: [],
    };
  }
  return {
    verdict: 'strong_apply',
    one_line: 'All three personas pass.',
    weakest_link: null,
    fix_checklist: [],
  };
}
