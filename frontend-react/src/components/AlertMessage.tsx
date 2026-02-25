type AlertType = 'success' | 'error' | 'info';

interface Props {
  message: string | null;
  type?: AlertType;
}

export default function AlertMessage({ message, type = 'info' }: Props) {
  if (!message) return null;
  const cls = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
  return (
    <div className={`alert ${cls}`} role="alert">
      {message}
    </div>
  );
}
