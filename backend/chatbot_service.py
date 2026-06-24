from langchain_core.prompts import PromptTemplate
from langchain_community.llms.fake import FakeListLLM

def setup_chatbot():
    # Using FakeListLLM so the project runs immediately without requiring an OpenAI API key.
    # For your final presentation, you can swap this with ChatOpenAI from langchain_openai!
    responses = [
        "That's a great question! For building muscle, make sure you're eating enough protein (1.6g-2.2g per kg) and progressively overloading your weights.",
        "Remember to stay hydrated! Drinking at least 3 liters of water is crucial for muscle recovery.",
        "To improve your squat form, keep your chest up, push your knees out, and ensure your knees don't cave inward.",
        "Consistency is key! Stick to your generated workout plan, and you'll see results in no time. You got this!"
    ]
    
    # Fake LLM cycles through the predefined responses
    llm = FakeListLLM(responses=responses)
    
    template = """
    You are an expert AI fitness coach. Answer the user's fitness question motivatingly.
    User Question: {question}
    Coach Answer:"""
    
    prompt = PromptTemplate(template=template, input_variables=["question"])
    
    # LangChain Expression Language (LCEL)
    chain = prompt | llm
    return chain

# Initialize the chain globally so it loads once when the server starts
fitness_chain = setup_chatbot()

def get_chat_response(user_message: str) -> str:
    """Invokes the LangChain RAG pipeline to get a response."""
    return fitness_chain.invoke({"question": user_message})

if __name__ == "__main__":
    # Local test
    print("User: How do I build muscle?")
    print("AI Coach:", get_chat_response("How do I build muscle?"))
