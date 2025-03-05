'use client';
import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Alert } from 'antd';

const { Option } = Select;

interface TaskFormValues {
  title: string;
  description: string;
  tags?: string[];
  budget_from: number;
  budget_to: number;
  deadline_days: number;
  number_of_reminders?: number;
  is_hard?: boolean;
  all_auto_responses?: boolean;
}

const TaskForm = () => {
  const [form] = Form.useForm();
  // Инициализируем token с пустой строкой и сразу как контролируемый
  const [token, setToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Убираем useEffect, так как инициализация теперь в начальном состоянии
  // Добавляем только синхронизацию с localStorage при изменении token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }, [token]);

  const onFinish = async (values: TaskFormValues) => {
    setLoading(true);
    try {
      const rules = {
        budget_from: 5000,
        budget_to: 8000,
        deadline_days: 5,
        qty_freelancers: 1
      };

      const params = new URLSearchParams({
        token,
        title: values.title,
        description: values.description,
        tags: values.tags?.join(', ') || '',
        budget_from: values.budget_from.toString(),
        budget_to: values.budget_to.toString(),
        deadline: values.deadline_days.toString(),
        reminds: values.number_of_reminders?.toString() || '0',
        all_auto_responses: values.all_auto_responses?.toString() || 'false',
        rules: JSON.stringify(rules)
      });

      const url = `https://deadlinetaskbot.productlove.ru/api/v1/tasks/client/newhardtask?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setStatus({ type: 'success', message: 'Задача успешно опубликована!' });
        form.resetFields();
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.message || 'Ошибка при создании задачи' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Произошла ошибка сети' });
    }
    setLoading(false);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {status && (
        <Alert
          message={status.message}
          type={status.type}
          showIcon
          closable
          onClose={() => setStatus(null)}
          className="mb-4"
        />
      )}
      
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          label="Токен авторизации"
          required
        >
          <Input
            value={token}
            onChange={handleTokenChange}
            placeholder="Введите токен"
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Заголовок"
          rules={[{ required: true, message: 'Введите заголовок' }]}
        >
          <Input placeholder="Заголовок..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Введите описание' }]}
        >
          <Input.TextArea placeholder="Описание..." />
        </Form.Item>

        <Form.Item
          name="tags"
          label="Теги"
        >
          <Select mode="tags" placeholder="вб, дизайн, фигма">
            <Option value="вб">вб</Option>
            <Option value="дизайн">дизайн</Option>
            <Option value="фигма">фигма</Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="budget_from"
            label="Бюджет от"
            rules={[{ required: true, message: 'Введите минимальный бюджет' }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="budget_to"
            label="Бюджет до"
            rules={[{ required: true, message: 'Введите максимальный бюджет' }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </div>

        <Form.Item
          name="deadline_days"
          label="Срок выполнения (дни)"
          rules={[{ required: true, message: 'Введите срок' }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item
          name="number_of_reminders"
          label="Количество напоминаний"
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item
          name="is_hard"
          label="Сложная задача"
          valuePropName="checked"
          initialValue={false}
        >
          <input type="checkbox" className="h-4 w-4" />
        </Form.Item>

        <Form.Item
          name="all_auto_responses"
          label="Все автоответы"
          valuePropName="checked"
          initialValue={false}
        >
          <input type="checkbox" className="h-4 w-4" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Создать задачу
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TaskForm;