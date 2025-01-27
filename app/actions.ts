import { revalidatePath } from 'next/cache';

export async function submitMessage(formData: FormData) {
  const message = formData.get('message') as string;

  if (!message?.trim()) {
    return { error: 'Message cannot be empty' };
  }

  try {
    const response = await fetch(`${'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.error || 'Failed to get response');
    }

    revalidatePath('/');

    return {
      userMessage: message,
      aiResponse: data.aiResponse,
    };
  } catch (error) {
    console.error('Error in submitMessage:', error);
    return {
      userMessage: message,
      aiResponse:
        "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      error:
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : 'An unknown error occurred',
    };
  }
}
