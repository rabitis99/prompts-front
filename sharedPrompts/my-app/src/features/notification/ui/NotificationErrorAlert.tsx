interface NotificationErrorAlertProps {
  message: string;
}

export function NotificationErrorAlert({ message }: NotificationErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

