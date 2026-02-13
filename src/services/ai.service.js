import { GoogleGenerativeAI } from "@google/generative-ai";

// Lấy API Key từ biến môi trường
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {
    async chatWithAI(message, history = []) {
        try {
            if (!API_KEY) {
                return {
                    success: false,
                    error: "Chưa cấu hình Gemini API Key (.env)"
                };
            }

            // 1. Chỉ định model 1.5-flash (model này phổ biến nhất)
            // Loại bỏ hoàn toàn systemInstruction khỏi đây vì có thể gây lỗi version API
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const systemPrompt = "Bạn là AgriFlow AI Assistant. Chuyên hỗ trợ người dùng AgriFlow về nông sản, giá cả, đặt hàng. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.";

            // 2. Xử lý lịch sử (Gemini bắt buộc phải bắt đầu bằng 'user')
            let chatHistory = [];

            // Lọc bỏ tin nhắn 'model' ở đầu lịch sử nếu có
            let filteredHistory = history;
            if (history.length > 0 && history[0].role === 'model') {
                filteredHistory = history.slice(1);
            }

            // Nếu lịch sử trống, chúng ta chèn Prompt hệ thống vào tin nhắn đầu tiên
            if (filteredHistory.length === 0) {
                chatHistory = [
                    { role: "user", parts: [{ text: "Chào bạn. " + systemPrompt }] },
                    { role: "model", parts: [{ text: "Chào bạn! Tôi là AgriFlow AI. Tôi đã sẵn sàng hỗ trợ bạn về thông tin nông sản và mua hàng. Bạn cần tôi giúp gì?" }] }
                ];
            } else {
                chatHistory = filteredHistory;
            }

            const chat = model.startChat({
                history: chatHistory,
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

            return { success: true, text };
        } catch (error) {
            console.error("Gemini AI Detail Error:", error);

            if (error.message?.includes('404')) {
                return {
                    success: false,
                    error: "Lỗi 404: Model AI chưa sẵn sàng cho Key này. Hãy thử tạo Key mới tại Google AI Studio và đảm bảo chọn Gemini 1.5 Flash."
                };
            }

            return { success: false, error: "AI đang bận. Vui lòng thử lại sau vài giây." };
        }
    }
};
