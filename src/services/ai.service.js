import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../lib/supabase";

// Lấy API Key từ biến môi trường
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {

    async getSystemContext() {
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select(`
                    id, title, price_per_unit, unit, quantity, province, average_rating, status,
                    categories:category_id (name)
                `)
                .limit(40);

            if (error) {
                console.error("Supabase error fetching products for AI:", error);
                return "Lỗi kết nối database khi lấy sản phẩm.";
            }

            console.log("AI fetching products context:", products?.length || 0, "products found.");

            if (!products || products.length === 0) return "Hiện chưa có bất kỳ sản phẩm nào trong hệ thống database.";

            const contextText = products.map(p =>
                `- [${p.id}] ${p.title}: ${p.price_per_unit.toLocaleString()}đ/${p.unit} (Loại: ${p.categories?.name || 'N/A'}, Khu vực: ${p.province}, ⭐ ${p.average_rating || 0}/5, Tồn: ${p.quantity}, Trạng thái: ${p.status})`
            ).join('\n');

            return `DỮ LIỆU SẢN PHẨM AGRIFLOW (CẬP NHẬT MỚI NHẤT):\n${contextText}`;
        } catch (error) {
            console.error("Lỗi lấy ngữ cảnh AI:", error);
            return "Không thể lấy dữ liệu sản phẩm.";
        }
    },

    async chatWithAI(message, history = [], userProfile = null) {
        try {
            if (!API_KEY) return { success: false, error: "Chưa cấu hình Gemini API Key (.env)" };

            const systemContext = await this.getSystemContext();
            const userRole = userProfile?.role === 'farmer' ? "NÔNG DÂN" : "NGƯỜI MUA";
            const userName = userProfile?.full_name || "Người dùng";

            const smartPrompt = `Bạn là Chuyên gia Cao cấp AgriFlow AI.
${systemContext}

NHIỆM VỤ CHIẾN LƯỢC:
1. Khi được hỏi về danh sách sản phẩm, hãy trình bày bằng danh sách Markdown đẹp mắt hoặc bảng (Table).
2. Phải ghi rõ Giá và Đơn vị tính (ví dụ: 50,000đ/kg).
3. Nếu người dùng là ${userRole}, hãy tư vấn dựa trên dữ liệu thật ở trên.
4. Luôn khuyến khích mua các mặt hàng có lượt đánh giá (⭐) cao.
5. Trả lời chuyên nghiệp, am hiểu nông sản miền Trung - Nam.`;

            // Sử dụng gemini-1.5-flash là phiên bản ổn định nhất (Không đổi sang 2.5)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Xử lý lịch sử (Đảm bảo bắt đầu bằng User)
            let chatHistory = [];
            let filteredHistory = history;
            if (history.length > 0 && history[0].role === 'model') {
                filteredHistory = history.slice(1);
            }

            if (filteredHistory.length === 0) {
                chatHistory = [
                    { role: "user", parts: [{ text: "Hãy đọc dữ liệu hệ thống và bắt đầu hỗ trợ tôi với vai trò chuyên gia. " + smartPrompt }] },
                    { role: "model", parts: [{ text: `Chào ${userName}! Tôi là AgriFlow AI. Tôi đã đọc dữ liệu hệ thống và sẵn sàng phân tích sản phẩm, giá cả giúp bạn. Bạn cần tư vấn về mặt hàng nào hôm nay?` }] }
                ];
            } else {
                chatHistory = filteredHistory;
            }

            const chat = model.startChat({ history: chatHistory });
            const result = await chat.sendMessage(message);
            const response = await result.response;

            return { success: true, text: response.text() };
        } catch (error) {
            console.error("Lỗi AI Chuyên sâu:", error);
            return { success: false, error: "AI đang bận xử lý dữ liệu phức tạp. Thử lại sau ít giây." };
        }
    }
};
