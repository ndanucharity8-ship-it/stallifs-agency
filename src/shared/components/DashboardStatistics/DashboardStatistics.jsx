import './DashboardStatistics.css';

function DashboardStatistics({
  statistics = [],
  className = '',
}) {
  const classes = [
    'dashboard-statistics',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={classes}
      aria-label="Dashboard statistics"
    >
      {statistics.map((stat, index) => {
        const {
          id,
          label,
          value,
          icon,
          description,
          variant = 'default',
        } = stat;

        return (
          <article
            className={`dashboard-statistic dashboard-statistic--${variant}`}
            key={id || `${label}-${index}`}
          >
            <div className="dashboard-statistic__header">
              <span className="dashboard-statistic__label">
                {label}
              </span>

              {icon && (
                <span
                  className="dashboard-statistic__icon"
                  aria-hidden="true"
                >
                  {icon}
                </span>
              )}
            </div>

            <div className="dashboard-statistic__value">
              {value}
            </div>

            {description && (
              <p className="dashboard-statistic__description">
                {description}
              </p>
            )}
          </article>
        );
      })}
    </section>
  );
}

export default DashboardStatistics;